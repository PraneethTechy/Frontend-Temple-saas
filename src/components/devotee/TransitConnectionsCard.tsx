import React from 'react';
import { Train, Bus, Car, ExternalLink, Compass, ShieldCheck } from 'lucide-react';
import { getTransitOptions, type TransitOption } from '../../utils/transitLinks.js';

interface TransitConnectionsCardProps {
  originName?: string;
  originAddress?: string;
  templeName?: string;
  templeCity?: string;
}

export const TransitConnectionsCard: React.FC<TransitConnectionsCardProps> = ({
  originName,
  originAddress,
  templeName,
  templeCity,
}) => {
  const options: TransitOption[] = getTransitOptions({
    originName,
    originAddress,
    templeName,
    templeCity,
  });

  return (
    <div className="bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm sm:text-base">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <span>Travel & Transit Booking Links</span>
          </div>
          <p className="text-xs text-stone-500">
            Search live schedules and reserve tickets directly through official travel portals.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-200/60 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Official & Verified Portals</span>
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((opt) => {
          const isTrain = opt.type === 'train';
          const isBus = opt.type === 'bus';

          const iconBg = isTrain
            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
            : isBus
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200/80';

          const badgeBg = isTrain
            ? 'bg-amber-100/80 text-amber-900 border-amber-200/80'
            : isBus
            ? 'bg-emerald-100/80 text-emerald-900 border-emerald-200/80'
            : 'bg-indigo-100/80 text-indigo-900 border-indigo-200/80';

          const buttonBg = isTrain
            ? 'bg-amber-800 hover:bg-amber-900 text-white'
            : isBus
            ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
            : 'bg-stone-800 hover:bg-stone-900 text-white';

          return (
            <div
              key={opt.id}
              className="bg-[#FCFBF8] border border-stone-200/90 hover:border-amber-300 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-xs group"
            >
              <div className="space-y-3">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${iconBg}`}>
                    {isTrain && <Train className="w-5 h-5" />}
                    {isBus && <Bus className="w-5 h-5" />}
                    {!isTrain && !isBus && <Car className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
                    {opt.badge}
                  </span>
                </div>

                {/* Title & Route Summary */}
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                    {opt.title}
                  </h4>
                  <div className="text-xs font-semibold text-amber-950 flex items-center gap-1">
                    <span>📍</span>
                    <span>{opt.searchSummary}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed">
                  {opt.description}
                </p>

                {/* Key Bullet Highlights */}
                <div className="pt-0.5 space-y-1 text-[11px] text-stone-600">
                  {opt.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Portal Links */}
              <div className="space-y-2.5 pt-2.5 border-t border-stone-200/70">
                {/* Primary Search Link */}
                <a
                  href={opt.primaryActionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer ${buttonBg}`}
                >
                  <span>{opt.primaryActionText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Direct Portals Quick Links */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Direct Booking Portals:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.portalLinks.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200/80 hover:border-amber-300 rounded-md text-[10px] font-medium transition-colors shadow-2xs"
                      >
                        <span>{p.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransitConnectionsCard;
