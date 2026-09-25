import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useGetServiceMonthAvailabilityQuery } from '../../store/api/devoteeApi.js';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Normalizes date object to local YYYY-MM-DD string
 */
const formatDateStr = (year, monthIndex, day) => {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const BookingCalendar = ({
  templeId,
  serviceId,
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  // Initialize view date based on selectedDate or today
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    return formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  }, [today]);

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      }
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth(); // 0 to 11
  const currentMonthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

  // Fetch real monthly availability from backend
  const {
    data: monthRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetServiceMonthAvailabilityQuery(
    {
      templeId,
      serviceId,
      month: currentMonthStr,
    },
    {
      skip: !templeId || !serviceId,
    }
  );

  // Month navigation
  const isPastMonth = useMemo(() => {
    return (
      currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonthIndex <= today.getMonth())
    );
  }, [currentYear, currentMonthIndex, today]);

  const handlePrevMonth = () => {
    if (isPastMonth) return;
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Map backend days availability
  const availabilityMap = useMemo(() => {
    const map = new Map();
    const days = monthRes?.data?.days;
    if (Array.isArray(days)) {
      for (const day of days) {
        map.set(day.date, day);
      }
    }
    return map;
  }, [monthRes]);

  // Generate calendar grid cells for current month
  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    const cells = [];

    // Leading empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({
        type: 'EMPTY',
        key: `pad-start-${i}`,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = formatDateStr(currentYear, currentMonthIndex, day);
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      const availInfo = availabilityMap.get(dateStr);
      // Available only if genuinely in the future/today AND has at least 1 bookable slot
      const isAvailable = !isPast && Boolean(availInfo?.isAvailable && availInfo?.availableSlotsCount > 0);
      const isUnavailable = !isPast && !isAvailable;

      cells.push({
        type: 'DAY',
        key: dateStr,
        day,
        dateStr,
        isPast,
        isToday,
        isAvailable,
        isUnavailable,
        isSelected,
        availableSlotsCount: availInfo?.availableSlotsCount || 0,
        totalSlotsCount: availInfo?.totalSlotsCount || 0,
      });
    }

    // Trailing empty cells to fill the last row if needed
    const totalCells = cells.length;
    const remainder = totalCells % 7;
    if (remainder > 0) {
      const fillCount = 7 - remainder;
      for (let i = 0; i < fillCount; i++) {
        cells.push({
          type: 'EMPTY',
          key: `pad-end-${i}`,
        });
      }
    }

    return cells;
  }, [currentYear, currentMonthIndex, todayStr, selectedDate, availabilityMap]);

  // Check if current month has zero slots configured anywhere
  const hasZeroConfiguredSlots = useMemo(() => {
    if (!monthRes?.data?.days || monthRes.data.days.length === 0) return false;
    return monthRes.data.days.every((d) => d.totalSlotsCount === 0);
  }, [monthRes]);

  return (
    <div
      className={`spiritual-card bg-white border border-spiritual-border rounded-3xl p-5 sm:p-7 shadow-spiritual-sm space-y-6 ${className}`}
    >
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between border-b border-spiritual-borderLight pb-4">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-spiritual-primary uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Booking Calendar
          </span>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-spiritual-text">
            {MONTH_NAMES[currentMonthIndex]} {currentYear}
          </h3>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-1.5">
          {isFetching && (
            <span className="text-[11px] text-spiritual-primary font-medium mr-2 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Checking availability...</span>
            </span>
          )}

          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPastMonth || isLoading || isFetching}
            aria-label="Previous month"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-spiritual-border text-spiritual-text hover:bg-spiritual-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isLoading || isFetching}
            aria-label="Next month"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-spiritual-border text-spiritual-text hover:bg-spiritual-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Unable to load availability. Please try again.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-[11px] font-bold text-red-700 underline hover:text-red-900 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Notice when service has no availability configured in DB */}
      {!isLoading && !error && hasZeroConfiguredSlots && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>No availability configured for this service in {MONTH_NAMES[currentMonthIndex]}.</span>
        </div>
      )}

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-bold text-spiritual-muted tracking-wider">
        {WEEK_DAYS.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-2">
          <div className="text-center py-2 text-xs text-spiritual-muted animate-pulse">
            Loading availability...
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 35 }).map((_, idx) => (
              <div
                key={idx}
                className="h-12 sm:h-14 rounded-2xl bg-spiritual-surface animate-pulse border border-spiritual-borderLight/50"
              />
            ))}
          </div>
        </div>
      ) : (
        /* Calendar Grid */
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarCells.map((cell) => {
            if (cell.type === 'EMPTY') {
              return (
                <div
                  key={cell.key}
                  className="h-12 sm:h-14 rounded-2xl bg-transparent pointer-events-none"
                  aria-hidden="true"
                />
              );
            }

            const {
              day,
              dateStr,
              isPast,
              isToday,
              isAvailable,
              isUnavailable,
              isSelected,
              availableSlotsCount,
            } = cell;

            // Generate descriptive accessible label
            const readableDate = `${MONTH_NAMES[currentMonthIndex]} ${day}, ${currentYear}`;
            let ariaLabel = `${readableDate}`;
            if (isPast) {
              ariaLabel += ', past';
            } else if (isAvailable) {
              ariaLabel += `, available (${availableSlotsCount} slot${availableSlotsCount !== 1 ? 's' : ''})`;
            } else {
              ariaLabel += ', unavailable';
            }
            if (isSelected) {
              ariaLabel += ', selected';
            }

            // Cell Styles
            let cellStyle = '';
            let indicator = null;

            if (isSelected) {
              // 1. Selected State: DevaSetu Gold Highlight
              cellStyle =
                'bg-spiritual-primary text-white font-bold ring-2 ring-spiritual-primary ring-offset-2 shadow-spiritual-sm';
              indicator = (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              );
            } else if (isPast) {
              // 2. Past State: Muted gray, reduced opacity, disabled
              cellStyle =
                'bg-gray-50/60 text-gray-300 border border-transparent opacity-40 cursor-not-allowed';
            } else if (isAvailable) {
              // 3. Available State: Subtle green tint, green dot, selectable
              cellStyle =
                'bg-emerald-50/60 text-emerald-900 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-spiritual-sm cursor-pointer transition-all font-semibold';
              indicator = (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                  title="Available"
                />
              );
            } else {
              // 4. Unavailable State: Soft neutral/muted, not aggressive red, disabled
              cellStyle =
                'bg-stone-50/70 text-stone-400 border border-dashed border-stone-200 cursor-not-allowed opacity-75';
            }

            return (
              <button
                key={cell.key}
                type="button"
                disabled={isPast || isUnavailable || isFetching}
                onClick={() => {
                  if (isAvailable) {
                    onSelectDate(dateStr);
                  }
                }}
                aria-label={ariaLabel}
                className={`h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center relative p-1 transition-all focus:outline-none focus:ring-2 focus:ring-spiritual-primary ${cellStyle}`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm">{day}</span>
                  {indicator}
                </div>

                {/* Subtitle / tag on desktop viewports */}
                {isToday && !isSelected && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-tight ${
                      isAvailable ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  >
                    Today
                  </span>
                )}

                {isUnavailable && !isPast && (
                  <span className="text-[8px] text-stone-400 hidden sm:block tracking-tighter">
                    Unavailable
                  </span>
                )}

                {isAvailable && !isSelected && (
                  <span className="text-[8px] text-emerald-700 hidden sm:block font-medium">
                    {availableSlotsCount} slot{availableSlotsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar Legend */}
      <div className="pt-3 border-t border-spiritual-borderLight flex flex-wrap items-center justify-between sm:justify-start gap-4 text-[11px] text-spiritual-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600/20" />
          <span className="font-medium text-spiritual-text">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300 border border-stone-400/20" />
          <span className="font-medium text-spiritual-text">Unavailable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 opacity-60" />
          <span>Past</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-spiritual-primary" />
          <span className="font-bold text-spiritual-primary">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
