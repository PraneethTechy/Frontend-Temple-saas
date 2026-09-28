import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import BookingCalendar from '../BookingCalendar.js';
import { useGetServiceAvailabilityQuery } from '../../../store/api/devoteeApi.js';
import type { Temple, Service } from '@shared/types/index.js';

export interface ServiceAvailabilitySlotItem {
  timeSlotId?: string;
  slotId?: string;
  _id?: string;
  templeId?: string;
  serviceId?: string;
  date?: string;
  startTime: string;
  endTime?: string;
  capacity?: number;
  bookedCount?: number;
  availableSeats?: number;
  availableCount?: number;
  isAvailable?: boolean;
}

export interface TempleAvailabilityModalTemple extends Partial<Temple> {
  _id: string;
  slug?: string;
  name?: string;
  city?: string;
}

export interface TempleAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  temple?: TempleAvailabilityModalTemple | null;
  services?: Partial<Service>[];
  initialServiceId?: string;

  initialDate?: string;
}

function isSlotItemArray(value: unknown): value is ServiceAvailabilitySlotItem[] {
  return Array.isArray(value);
}

export const TempleAvailabilityModal: React.FC<TempleAvailabilityModalProps> = ({
  isOpen,
  onClose,
  temple,
  services = [],
  initialServiceId = '',
  initialDate = '',
}) => {
  const navigate = useNavigate();

  // Pick first Darshan service or first service
  const defaultServiceId = useMemo((): string => {
    if (initialServiceId) return initialServiceId;
    const darshanService = services.find(
      (s) => s.type?.toUpperCase() === 'DARSHAN' || s.name?.toLowerCase().includes('darshan')
    );
    return darshanService?._id || services[0]?._id || '';
  }, [services, initialServiceId]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(defaultServiceId);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<ServiceAvailabilitySlotItem | null>(null);

  // Sync state if modal reopens with different initial props
  useEffect(() => {
    if (isOpen) {
      if (initialServiceId) setSelectedServiceId(initialServiceId);
      if (initialDate) setSelectedDate(initialDate);
      setSelectedSlot(null);
    }
  }, [isOpen, initialServiceId, initialDate]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch real-time available slots for the selected date
  const {
    data: availabilityRes,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
  } = useGetServiceAvailabilityQuery(
    {
      templeId: temple?._id || '',
      serviceId: selectedServiceId,
      date: selectedDate,
    },
    {
      skip: !temple?._id || !selectedServiceId || !selectedDate || !isOpen,
    }
  );

  const rawSlots: ServiceAvailabilitySlotItem[] = isSlotItemArray(availabilityRes?.data)
    ? availabilityRes.data
    : [];
  const currentService = services.find((s) => s._id === selectedServiceId) || services[0];

  const handleContinueBooking = (): void => {
    if (!selectedServiceId || !selectedDate) return;

    const queryParams = new URLSearchParams({
      date: selectedDate,
    });

    if (selectedSlot?._id || selectedSlot?.slotId) {
      queryParams.set('slotId', (selectedSlot._id || selectedSlot.slotId) as string);
    }

    onClose();
    navigate(`/temples/${temple?.slug || ''}/book/${selectedServiceId}?${queryParams.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-[#FCFBF7] rounded-3xl border border-amber-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="availability-modal-title"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-amber-200/60 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 id="availability-modal-title" className="font-serif font-bold text-base sm:text-lg text-stone-800">
                Check Darshan & Seva Availability
              </h2>
              <p className="text-[11px] text-stone-500">
                {temple?.name} · {temple?.city}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns on Desktop (Left: Service + Calendar; Right: Slots) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Service Selector Dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-2xs space-y-2">
            <label htmlFor="service-select" className="block text-xs font-semibold text-stone-700">
              Select Offering / Seva
            </label>
            <select
              id="service-select"
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#FCFBF7] border border-amber-200/80 rounded-xl text-xs sm:text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.type}) — {s.price === 0 ? 'Free' : `₹${s.price}`}
                </option>
              ))}
            </select>
          </div>

          {/* Grid Layout: Calendar on Left, Slots List on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Reusable Interactive Calendar (7 cols) */}
            <div className="lg:col-span-7">
              <BookingCalendar
                templeId={temple?._id || ''}
                serviceId={selectedServiceId}
                selectedDate={selectedDate}
                onSelectDate={(dateStr) => {
                  setSelectedDate(dateStr);
                  setSelectedSlot(null);
                }}
                className="shadow-2xs"
              />
            </div>

            {/* Right: Slots List for Selected Date (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-amber-200/60 rounded-3xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Available Slots
                  </span>
                  <h3 className="font-serif font-bold text-sm text-stone-800">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                {isSlotsFetching && (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                )}
              </div>

              {/* Slots Container */}
              <div className="max-h-[280px] overflow-y-auto space-y-2.5 pr-1">
                {isSlotsLoading ? (
                  <div className="py-8 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
                    <p className="text-xs text-stone-500">Checking time slots...</p>
                  </div>
                ) : rawSlots.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 space-y-1">
                    <AlertCircle className="w-6 h-6 text-stone-300 mx-auto" />
                    <p className="font-medium text-stone-600">No slots available for this date</p>
                    <p className="text-[11px] text-stone-400">
                      Please select another date highlighted in green on the calendar.
                    </p>
                  </div>
                ) : (
                  rawSlots.map((slot) => {
                    const isAvailable = Boolean(slot.isAvailable && (slot.availableSeats || 0) > 0);
                    const isSelected = selectedSlot?._id === slot._id || selectedSlot?.slotId === slot._id;

                    return (
                      <button
                        key={slot._id || slot.slotId}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${!isAvailable
                            ? 'bg-stone-50 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'bg-amber-500/10 border-amber-600 ring-2 ring-amber-600/20 text-stone-900 shadow-2xs'
                              : 'bg-[#FCFBF7] border-amber-200/60 hover:border-amber-400 text-stone-800 cursor-pointer'
                          }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>
                              {slot.startTime} {slot.endTime ? `– ${slot.endTime}` : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {isAvailable ? (
                              <span className="text-emerald-700 font-medium">
                                {slot.availableSeats} of {slot.capacity} slots left
                              </span>
                            ) : (
                              <span className="text-rose-600 font-medium">Fully Booked</span>
                            )}
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <div className={`w-3.5 h-3.5 rounded-full border ${isAvailable ? 'border-emerald-500 bg-emerald-50' : 'border-stone-300'}`} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Service Pricing & CTA */}
              <div className="pt-3 border-t border-amber-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Offering Price</span>
                  <span className="font-serif font-bold text-base text-amber-700">
                    {currentService?.price === 0 ? 'Free' : `₹${currentService?.price || 0}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleContinueBooking}
                  disabled={!selectedDate}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue to Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempleAvailabilityModal;
