import React from 'react';
import { Landmark, Clock, ArrowRight, Calendar } from 'lucide-react';

export const DevotionalOfferings = ({
  services = [],
  slug,
  selectedServiceId,
  onOpenAvailabilityModal,
}) => {
  if (!services || services.length === 0) {
    return null;
  }

  // Show top 3 services compactly per prompt specifications
  const displayedServices = services.slice(0, 3);
  const hasMore = services.length > 3;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-stone-800">
            Devotional Offerings
          </h2>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => onOpenAvailabilityModal?.(services[0]?._id)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({services.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3 Information Cards in One Row (No images) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {displayedServices.map((service) => {
          const isSelected = selectedServiceId === service._id;
          const formattedPrice = service.price === 0 ? 'Free' : `₹${service.price}`;

          return (
            <div
              key={service._id}
              className={`spiritual-card bg-white border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-spiritual-md min-h-[175px] ${
                isSelected
                  ? 'border-amber-600 ring-2 ring-amber-600/20'
                  : 'border-amber-200/60 hover:border-amber-400'
              }`}
            >
              <div className="space-y-2">
                {/* Header: Type and Price */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                    {service.type || 'Pooja'}
                  </span>
                  <span className="font-serif font-bold text-base text-amber-700">
                    {formattedPrice}
                  </span>
                </div>

                {/* Service Name */}
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-800 leading-snug">
                  {service.name}
                </h3>

                {/* Duration */}
                {service.duration > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>{service.duration} mins</span>
                  </div>
                )}

                {/* Description snippet */}
                {service.description && (
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Actions: Consistent buttons opening the unified availability/booking flow */}
              <div className="pt-3 mt-3 border-t border-amber-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAvailabilityModal?.(service._id)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#FCFBF7] hover:bg-amber-50 text-stone-700 border border-amber-200/70'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-amber-700" />
                  <span>Check Slots</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAvailabilityModal?.(service._id)}
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DevotionalOfferings;
