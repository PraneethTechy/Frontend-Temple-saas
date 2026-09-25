import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

export const DarshanSchedule = ({
  temple,
  services = [],
  slug,
  selectedServiceId,
  setSelectedServiceId,
  selectedDate,
  setSelectedDate,
  availabilityData,
  isCheckingAvailability,
  onCheckAvailability,
}) => {
  const navigate = useNavigate();
  const weeklyTimings = temple?.timings?.weekly || [];

  return (
    <section id="darshan-schedule" className="scroll-mt-28 space-y-8">
      {/* Section Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Visiting Schedule</span>
        </div>
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-spiritual-text">
          Darshan Timings & Live Slots
        </h2>
        <p className="text-xs sm:text-sm text-spiritual-muted mt-1">
          Review daily darshan hours and check real-time available time slots before visiting.
        </p>
      </div>

      {/* Part 1: Weekly Timetable & Special Notes */}
      {weeklyTimings.length > 0 && (
        <div className="spiritual-card p-6 bg-white border border-amber-200/60 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <h3 className="font-serif font-bold text-base text-spiritual-text flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-700" />
              <span>Standard Darshan Schedule</span>
            </h3>
            {temple?.timings?.specialNotes && (
              <span className="text-xs text-amber-800 font-medium hidden sm:inline">
                ℹ {temple.timings.specialNotes}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {weeklyTimings.map((t) => (
              <div
                key={t.day}
                className={`p-3 rounded-xl border text-center space-y-1 ${
                  t.isOpen
                    ? 'bg-[#FCFBF7] border-amber-200/60 text-stone-800'
                    : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-spiritual-muted">
                  {t.day.slice(0, 3)}
                </div>
                {t.isOpen ? (
                  <div className="text-[11px] font-medium leading-snug">
                    <div>{t.morningOpening} - {t.morningClosing}</div>
                    <div className="text-stone-400 text-[10px]">&</div>
                    <div>{t.eveningOpening} - {t.eveningClosing}</div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-600 font-semibold py-2">Closed</div>
                )}
              </div>
            ))}
          </div>

          {temple?.timings?.specialNotes && (
            <div className="sm:hidden text-xs text-amber-800 font-medium pt-2 border-t border-amber-100">
              Note: {temple.timings.specialNotes}
            </div>
          )}
        </div>
      )}

      {/* Part 2: Real-Time Slot Availability Discovery Widget */}
      {services.length > 0 && (
        <div className="spiritual-card p-6 sm:p-8 bg-gradient-to-b from-[#FCFBF7] to-white border-2 border-amber-500/25 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Temple Slot Discovery</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-spiritual-text">
                Check Darshan & Seva Availability
              </h3>
            </div>

            {/* Service & Date Pickers */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Service Dropdown */}
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  onCheckAvailability(e.target.value, selectedDate);
                }}
                className="px-3.5 py-2 bg-white border border-amber-200/80 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="">Select a Service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.price === 0 ? 'Free' : `₹${s.price}`})
                  </option>
                ))}
              </select>

              {/* Date Input */}
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  onCheckAvailability(selectedServiceId, e.target.value);
                }}
                className="px-3.5 py-2 bg-white border border-amber-200/80 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              />

              <button
                type="button"
                onClick={() => onCheckAvailability()}
                disabled={!selectedServiceId || isCheckingAvailability}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isCheckingAvailability ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Check Slots</span>
                )}
              </button>
            </div>
          </div>

          {/* Results Output */}
          {!selectedServiceId ? (
            <div className="py-8 text-center text-spiritual-muted text-xs">
              Select an active seva or darshan from the dropdown above to view real-time capacity and time slots.
            </div>
          ) : isCheckingAvailability ? (
            <div className="py-10 text-center text-spiritual-muted space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
              <p className="text-xs">Querying authoritative temple schedule for {selectedDate}...</p>
            </div>
          ) : availabilityData && availabilityData.length === 0 ? (
            <div className="spiritual-card p-6 text-center bg-white border border-amber-200/70 max-w-md mx-auto rounded-2xl">
              <p className="text-xs font-semibold text-spiritual-text mb-1">
                No slots open on {selectedDate}
              </p>
              <p className="text-[11px] text-spiritual-muted leading-relaxed">
                This service has no active slots scheduled on this date or capacity is fully booked. Please select another date.
              </p>
            </div>
          ) : availabilityData && availabilityData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-spiritual-muted">
                <span>Available time slots for {selectedDate}:</span>
                <span className="font-semibold text-amber-800">
                  {availabilityData.length} slot(s) open
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availabilityData.map((slot) => {
                  const hasSeats = slot.availableSeats > 0;

                  return (
                    <div
                      key={slot.slotId || slot._id}
                      className="p-4 bg-white rounded-2xl border border-amber-200/70 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-spiritual-text flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-700" />
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hasSeats
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {hasSeats ? `${slot.availableSeats} Seats Left` : 'Fully Booked'}
                        </span>
                      </div>

                      <div className="text-xs text-spiritual-muted space-y-1">
                        <div className="flex justify-between">
                          <span>Total Capacity:</span>
                          <span className="font-semibold text-stone-700">{slot.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-bold text-emerald-700">{slot.availableSeats}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/temples/${slug}/book/${selectedServiceId}?date=${selectedDate}&slotId=${slot._id || slot.slotId}`
                          )
                        }
                        disabled={!hasSeats}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Book This Slot</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default DarshanSchedule;
