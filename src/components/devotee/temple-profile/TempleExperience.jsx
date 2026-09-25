import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ArrowRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const TempleExperience = ({
  services = [],
  slug,
  selectedServiceId,
  onSelectServiceForAvailability,
}) => {
  const navigate = useNavigate();

  if (!services || services.length === 0) {
    return null; // Gracefully omit section if temple currently has no active services
  }

  return (
    <section id="services-section" className="scroll-mt-28 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Devotional Offerings</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-spiritual-text">
            Experience the Temple
          </h2>
          <p className="text-xs sm:text-sm text-spiritual-muted mt-1">
            Choose from active poojas, sevas, and sacred darshans organized by the temple authority.
          </p>
        </div>

        <span className="text-xs font-semibold text-amber-800 shrink-0">
          {services.length} {services.length === 1 ? 'Offering' : 'Offerings Available'}
        </span>
      </div>

      {/* Services Grid (3 col desktop, 2 col tablet, 1 col mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const isSelected = selectedServiceId === service._id;

          return (
            <div
              key={service._id}
              className={`spiritual-card bg-white border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-spiritual-md ${
                isSelected
                  ? 'border-amber-600 ring-2 ring-amber-600/20'
                  : 'border-amber-200/60 hover:border-amber-400'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Service Type & Price */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                    {service.type}
                  </span>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold text-amber-700">
                      {service.price === 0 ? 'Free' : `₹${service.price}`}
                    </span>
                    {service.duration > 0 && (
                      <p className="text-[10px] text-spiritual-muted flex items-center justify-end gap-1">
                        <Clock className="w-2.5 h-2.5" /> {service.duration} mins
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Name */}
                <h3 className="font-serif font-bold text-base sm:text-lg text-spiritual-text leading-snug">
                  {service.name}
                </h3>

                {/* Service Description */}
                {service.description && (
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}

                {/* Rules / Protocols Preview if available */}
                {Array.isArray(service.rules) && service.rules.length > 0 && (
                  <div className="text-[11px] text-stone-500 bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40 space-y-0.5">
                    <span className="font-semibold text-stone-700 block">Key Guideline:</span>
                    <p className="truncate">{service.rules[0]}</p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-4 mt-4 border-t border-amber-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectServiceForAvailability(service)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-[#FCFBF7] hover:bg-amber-100 text-stone-700 border border-amber-200/70'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Viewing Slots' : 'Check Slots'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/temples/${slug}/book/${service._id}`)}
                  className="py-2 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
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

export default TempleExperience;
