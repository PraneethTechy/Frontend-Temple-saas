import React, { useState, useMemo } from 'react';
import { CalendarCheck, Calendar, BarChart2 } from 'lucide-react';
import { ChartEmptyState } from './ChartStates.jsx';

/**
 * Daily Booking Calendar (Analytics Heatmap)
 * Visualizes daily booking volume for a real calendar month with 7 weekday columns (Mon-Sun).
 *
 * Requirements:
 * - Real calendar grid with 7 weekday columns: Mon | Tue | Wed | Thu | Fri | Sat | Sun
 * - Rows correspond to calendar weeks
 * - Each real date appears EXACTLY ONCE under its real weekday
 * - September 1, 2026 starts on Tuesday
 * - Visually empty placeholder cells ONLY where required to align calendar weeks
 * - Each real date cell contains Date number, Booking count, and background intensity
 * - Real booking data mapped from MongoDB
 * - Dynamic calculations for Peak Day, Lowest Day, and Avg / Day
 * - Retains existing premium DevaSetu design system and palette
 */
export const BookingActivityCalendar = ({
  data = {},
  selectedDate,
  onMonthChange,
  height = 320,
  emptyMessage = 'No booking activity recorded for this period.',
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [internalDate, setInternalDate] = useState(() => new Date(2026, 8, 1)); // Default: Sep 2026

  // Resolved active date (controlled or internal)
  const activeDate = useMemo(() => {
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      return selectedDate;
    }
    if (data?.year !== undefined && data?.month !== undefined) {
      return new Date(data.year, data.month, 1);
    }
    return internalDate;
  }, [selectedDate, data?.year, data?.month, internalDate]);

  const year = activeDate.getFullYear();
  const monthIndex = activeDate.getMonth(); // 0 = Jan, 8 = Sep

  // 7 Weekday columns (Monday to Sunday)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Days in current selected month (dynamically accounts for 28/29, 30, 31)
  const daysInMonth = useMemo(() => {
    return new Date(year, monthIndex + 1, 0).getDate();
  }, [year, monthIndex]);

  // Starting weekday of the 1st of the month
  // JS getDay(): 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  // Mon-Sun offset (Mon = 0, Tue = 1, ... Sun = 6):
  const startDayOffset = useMemo(() => {
    const firstDayJs = new Date(year, monthIndex, 1).getDay();
    return (firstDayJs + 6) % 7;
  }, [year, monthIndex]);

  // Fast booking count lookup by date 'YYYY-MM-DD'
  const bookingCountMap = useMemo(() => {
    const map = new Map();

    // 1. From all-date dictionary if provided by backend
    if (data.bookingCountsByDate && typeof data.bookingCountsByDate === 'object') {
      Object.entries(data.bookingCountsByDate).forEach(([dateStr, count]) => {
        if (dateStr) {
          map.set(dateStr.slice(0, 10), Number(count) || 0);
        }
      });
    }

    // 2. From days array if provided
    if (Array.isArray(data.days)) {
      data.days.forEach((d) => {
        if (d && d.date) {
          map.set(d.date.slice(0, 10), Number(d.count) || 0);
        }
      });
    }

    return map;
  }, [data]);

  // Build the list of real days in the month and calculate statistics dynamically
  const { monthDays, maxCount, dynamicStats } = useMemo(() => {
    const daysList = [];
    const monthShort = new Date(year, monthIndex, 1).toLocaleDateString('en-IN', {
      month: 'short',
    });
    const monthLong = new Date(year, monthIndex, 1).toLocaleDateString('en-IN', {
      month: 'long',
    });

    let totalMonthBookings = 0;
    let max = 0;
    let peak = { date: '', count: 0, label: 'N/A' };
    let lowest = { date: '', count: Infinity, label: 'N/A' };

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const count = bookingCountMap.get(dateStr) ?? 0;
      totalMonthBookings += count;

      if (count > max) {
        max = count;
      }

      const dateObj = new Date(year, monthIndex, dayNum);
      const weekdayIndex = (dateObj.getDay() + 6) % 7;
      const weekdayName = weekdays[weekdayIndex];
      const dateLabel = `${dayNum} ${monthShort} ${year}`;
      const fullDateLabel = `${weekdayName}, ${dayNum} ${monthLong} ${year}`;

      if (count > peak.count || (!peak.date && count >= 0)) {
        peak = { date: dateStr, count, label: dateLabel };
      }
      if (count < lowest.count) {
        lowest = { date: dateStr, count, label: dateLabel };
      }

      daysList.push({
        dayNum,
        dateStr,
        count,
        dateLabel,
        fullDateLabel,
        weekday: weekdayName,
        weekdayIndex,
      });
    }

    if (lowest.count === Infinity) {
      lowest = { date: '', count: 0, label: 'N/A' };
    }

    const avg = daysInMonth > 0 ? (totalMonthBookings / daysInMonth).toFixed(1) : '0.0';

    return {
      monthDays: daysList,
      maxCount: Math.max(max, 1),
      dynamicStats: {
        peakDay: peak.count > 0 ? peak : (data.stats?.peakDay?.count > 0 ? data.stats.peakDay : peak),
        lowestDay: lowest.date ? lowest : (data.stats?.lowestDay || lowest),
        avgPerDay: avg,
        totalBookings: totalMonthBookings,
      },
    };
  }, [year, monthIndex, daysInMonth, bookingCountMap, weekdays, data.stats]);

  // 6-step color intensity scale matching DevaSetu palette
  const getCellColor = (count) => {
    if (!count || count <= 0) {
      return {
        bg: 'bg-[#FDF8F2]',
        border: 'border-[#F2EAE0]',
        dateText: 'text-spiritual-text',
        countText: 'text-slate-400 font-normal',
      };
    }
    const ratio = count / maxCount;
    if (ratio <= 0.15) {
      return {
        bg: 'bg-[#F8EADB]',
        border: 'border-[#EBDCC9]',
        dateText: 'text-amber-950 font-semibold',
        countText: 'text-amber-900 font-bold',
      };
    }
    if (ratio <= 0.35) {
      return {
        bg: 'bg-[#F5D2BC]',
        border: 'border-[#E4BD9F]',
        dateText: 'text-amber-950 font-semibold',
        countText: 'text-amber-950 font-bold',
      };
    }
    if (ratio <= 0.6) {
      return {
        bg: 'bg-[#EA8E77]',
        border: 'border-[#D8765D]',
        dateText: 'text-white font-bold',
        countText: 'text-white font-bold',
      };
    }
    if (ratio <= 0.85) {
      return {
        bg: 'bg-[#C94D60]',
        border: 'border-[#B3384A]',
        dateText: 'text-white font-bold',
        countText: 'text-white font-bold',
      };
    }
    return {
      bg: 'bg-[#6E182A]',
      border: 'border-[#541220]',
      dateText: 'text-white font-bold',
      countText: 'text-amber-200 font-bold',
    };
  };

  // Build calendar week rows (7 columns per row)
  const weeks = useMemo(() => {
    const rows = [];
    let currentWeek = [];

    // 1. Visually empty placeholder cells for days before the 1st
    for (let p = 0; p < startDayOffset; p++) {
      currentWeek.push({
        isPlaceholder: true,
        key: `lead-placeholder-${p}`,
      });
    }

    // 2. Real date cells
    monthDays.forEach((dayItem) => {
      currentWeek.push({
        ...dayItem,
        isPlaceholder: false,
        key: dayItem.dateStr,
      });

      if (currentWeek.length === 7) {
        rows.push(currentWeek);
        currentWeek = [];
      }
    });

    // 3. Visually empty placeholder cells to complete the final row
    if (currentWeek.length > 0) {
      const remaining = 7 - currentWeek.length;
      for (let p = 0; p < remaining; p++) {
        currentWeek.push({
          isPlaceholder: true,
          key: `trail-placeholder-${p}`,
        });
      }
      rows.push(currentWeek);
    }

    return rows;
  }, [startDayOffset, monthDays]);

  const stats = dynamicStats;

  // Empty state check
  const hasAnyData = Object.keys(data).length > 0;
  if (!hasAnyData && (!data.days || data.days.length === 0)) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  return (
    <div className="flex flex-col gap-3.5 w-full py-1 min-w-0">
      {/* Real Monthly Calendar Grid */}
      <div className="w-full select-none">
        {/* Weekday Column Headers (Mon to Sun) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 w-full text-center">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="text-[10px] sm:text-[11px] font-mono text-spiritual-muted font-semibold uppercase tracking-wider py-0.5"
            >
              {weekday}
            </div>
          ))}
        </div>

        {/* Calendar Week Rows */}
        <div className="space-y-1 sm:space-y-1.5 w-full">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full">
              {week.map((cell) => {
                if (cell.isPlaceholder) {
                  return (
                    <div
                      key={cell.key}
                      className="aspect-[5/4] sm:aspect-auto sm:h-12 rounded-lg border border-dashed border-[#EFE8DD]/70 bg-[#FAF6F0]/40 flex items-center justify-center pointer-events-none select-none"
                    >
                      <span className="text-[#D8CEBF] text-xs font-mono select-none">—</span>
                    </div>
                  );
                }

                const style = getCellColor(cell.count);
                const isHovered = hoveredCell?.dateStr === cell.dateStr;

                return (
                  <div
                    key={cell.key}
                    className={`aspect-[5/4] sm:aspect-auto sm:h-12 rounded-lg border transition-all duration-150 cursor-pointer relative p-1 sm:p-1.5 flex flex-col justify-between select-none ${
                      style.bg
                    } ${style.border} ${
                      isHovered
                        ? 'ring-2 ring-spiritual-primary scale-[1.05] shadow-md z-20'
                        : 'hover:scale-[1.02] hover:shadow-xs'
                    }`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({
                        ...cell,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {/* Top: Date Number */}
                    <div className="flex items-center justify-between w-full leading-none">
                      <span className={`text-[10px] sm:text-[11px] font-mono ${style.dateText}`}>
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* Bottom: Booking Count */}
                    <div className="flex items-center justify-between w-full leading-none pt-0.5">
                      <span className={`text-[9.5px] sm:text-[11px] font-mono ${style.countText}`}>
                        {cell.count}
                      </span>
                      <span
                        className={`text-[8.5px] uppercase tracking-tighter opacity-70 hidden sm:inline ${style.dateText}`}
                      >
                        {cell.count === 1 ? 'bk' : 'bks'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Heatmap Legend */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-1 text-[10px] text-spiritual-muted font-medium select-none">
          <span>Low</span>
          <div className="w-3.5 h-3.5 rounded-[2.5px] bg-[#FDF8F2] border border-[#F2EAE0]" title="0 bookings" />
          <div className="w-3.5 h-3.5 rounded-[2.5px] bg-[#F8EADB] border border-[#EBDCC9]" title="Low volume" />
          <div className="w-3.5 h-3.5 rounded-[2.5px] bg-[#F5D2BC] border border-[#E4BD9F]" title="Moderate volume" />
          <div className="w-3.5 h-3.5 rounded-[2.5px] bg-[#EA8E77] border border-[#D8765D]" title="Elevated volume" />
          <div className="w-3.5 h-3.5 rounded-[2.5px] bg-[#C94D60] border border-[#B3384A]" title="High volume" />
          <div className="w-3.5 h-3.5 rounded-[2.5px] bg-[#6E182A] border border-[#541220]" title="Peak volume" />
          <span>High</span>
        </div>
      </div>

      {/* 3 Summary Cards in a 3-Column Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full select-none pt-1">
        {/* Peak Day */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE8DD] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9.5px] sm:text-[10px] font-bold text-[#C2410C] uppercase tracking-wider truncate">
              Peak Day
            </span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border border-[#FED7AA] bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] shrink-0">
              <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="min-w-0">
            <div
              className="text-xs sm:text-[13px] font-bold text-spiritual-text leading-tight truncate"
              title={stats.peakDay.label}
            >
              {stats.peakDay.label || 'N/A'}
            </div>
            <div className="text-[10px] sm:text-[11px] text-spiritual-muted font-medium mt-0.5 truncate">
              <span className="font-semibold text-slate-800">{stats.peakDay.count}</span>{' '}
              {stats.peakDay.count === 1 ? 'booking' : 'bookings'}
            </div>
          </div>
        </div>

        {/* Lowest Day */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE8DD] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9.5px] sm:text-[10px] font-bold text-[#BE123C] uppercase tracking-wider truncate">
              Lowest Day
            </span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border border-[#FECDD3] bg-[#FFF1F2] flex items-center justify-center text-[#BE123C] shrink-0">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="min-w-0">
            <div
              className="text-xs sm:text-[13px] font-bold text-spiritual-text leading-tight truncate"
              title={stats.lowestDay.label}
            >
              {stats.lowestDay.label || 'N/A'}
            </div>
            <div className="text-[10px] sm:text-[11px] text-spiritual-muted font-medium mt-0.5 truncate">
              <span className="font-semibold text-slate-800">{stats.lowestDay.count}</span>{' '}
              {stats.lowestDay.count === 1 ? 'booking' : 'bookings'}
            </div>
          </div>
        </div>

        {/* Average / Day */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE8DD] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9.5px] sm:text-[10px] font-bold text-[#B45309] uppercase tracking-wider truncate">
              Avg / Day
            </span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border border-[#FED7AA] bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] shrink-0">
              <BarChart2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-[14px] font-bold font-mono text-spiritual-text leading-tight">
              {stats.avgPerDay}
            </div>
            <div className="text-[10px] sm:text-[11px] text-spiritual-muted font-medium mt-0.5 truncate">
              bookings / day
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-xl bg-spiritual-text text-white text-[11px] font-sans shadow-xl border border-gray-700 -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <div className="font-semibold text-gray-200">{hoveredCell.fullDateLabel}</div>
          <div className="text-amber-300 font-mono font-bold text-xs mt-0.5">
            {hoveredCell.count} {hoveredCell.count === 1 ? 'booking' : 'bookings'}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingActivityCalendar;
