import React from 'react';
import {
  MapPin,
  Clock,
  Landmark,
  Users,
} from 'lucide-react';

export const TempleQuickInfo = ({ temple, reviewSummary }) => {
  // Determine today's schedule if weekly timings are populated
  const todayWeekday = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()];
  const todaySchedule = temple?.timings?.weekly?.find((t) => t.day === todayWeekday) || temple?.timings?.weekly?.[0];

  const formatTimeStr = (t) => {
    if (!t) return '';
    const [hh, mm] = t.split(':');
    const hour = parseInt(hh, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${mm || '00'} ${suffix}`;
  };

  let timingsDisplay = '06:00 AM - 12:00 PM | 04:00 PM - 09:00 PM';
  if (todaySchedule?.isOpen && todaySchedule?.morningOpening) {
    const morning = `${formatTimeStr(todaySchedule.morningOpening)} - ${formatTimeStr(todaySchedule.morningClosing)}`;
    const evening = todaySchedule.eveningOpening
      ? ` | ${formatTimeStr(todaySchedule.eveningOpening)} - ${formatTimeStr(todaySchedule.eveningClosing)}`
      : '';
    timingsDisplay = `${morning}${evening}`;
  } else if (temple?.timings?.specialNotes) {
    timingsDisplay = temple.timings.specialNotes;
  }

  const categoryName =
    temple?.categories?.[0]?.name || temple?.templeType || 'Heritage';

  const facilitiesCount = Array.isArray(temple?.facilities) ? temple.facilities.length : 0;
  const facilitiesDisplay = facilitiesCount > 0
    ? `${facilitiesCount} Facilities Available`
    : 'Pilgrim Facilities Available';

  return (
    <div className="spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs px-4 sm:px-6 py-3 sm:py-3.5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-amber-100">
        {/* 1. Location */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-spiritual-muted">
              Location
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 truncate" title={`${temple.city}, ${temple.state}`}>
              {temple.city}, {temple.state}
            </div>
          </div>
        </div>

        {/* 2. Darshan Timings */}
        <div className="flex items-center gap-3 sm:pl-4 pt-2 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-spiritual-muted">
              Darshan Timings
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 truncate" title={timingsDisplay}>
              {timingsDisplay}
            </div>
          </div>
        </div>

        {/* 3. Temple Category */}
        <div className="flex items-center gap-3 sm:pl-4 pt-2 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-spiritual-muted">
              Temple Category
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 truncate" title={categoryName}>
              {categoryName}
            </div>
          </div>
        </div>

        {/* 4. Facilities */}
        <div className="flex items-center gap-3 sm:pl-4 pt-2 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-spiritual-muted">
              Facilities
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 truncate">
              {facilitiesDisplay}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempleQuickInfo;
