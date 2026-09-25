import React from 'react';
import {
  ShieldCheck,
  Camera,
  Footprints,
  Droplets,
  Users,
  Car,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

export const VisitingGuidelines = ({ temple }) => {
  const dressCode = temple?.dressCode || 'Traditional attire recommended.';
  const facilities = Array.isArray(temple?.facilities) ? temple.facilities : [];
  const guidelines = Array.isArray(temple?.guidelines) ? temple.guidelines : [];

  // Determine specific guidelines if present
  const photoGuideline =
    guidelines.find((g) => g.toLowerCase().includes('photo')) || 'Limited areas only.';
  const footwearGuideline =
    guidelines.find((g) => g.toLowerCase().includes('footwear') || g.toLowerCase().includes('shoe')) ||
    'Use designated counters.';

  // Map known facilities to subtle icons
  const getFacilityIcon = (fac) => {
    const lower = fac.toLowerCase();
    if (lower.includes('water')) return <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
    if (lower.includes('restroom') || lower.includes('toilet')) return <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (lower.includes('queue')) return <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    if (lower.includes('cloak') || lower.includes('locker')) return <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    if (lower.includes('parking')) return <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    if (lower.includes('assist') || lower.includes('help')) return <HelpCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
  };

  return (
    <div className="spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <h2 className="font-serif font-bold text-base sm:text-lg text-stone-800">
          Guidelines & Amenities
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Pilgrim Protocols (5 cols) */}
        <div className="md:col-span-5 space-y-3 text-xs">
          {/* Dress Code */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block text-[11px]">Dress Code</span>
              <p className="text-stone-600 leading-snug">{dressCode}</p>
            </div>
          </div>

          {/* Photography */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <Camera className="w-3 h-3" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block text-[11px]">Photography</span>
              <p className="text-stone-600 leading-snug">{photoGuideline}</p>
            </div>
          </div>

          {/* Footwear */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <Footprints className="w-3 h-3" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block text-[11px]">Footwear</span>
              <p className="text-stone-600 leading-snug">{footwearGuideline}</p>
            </div>
          </div>
        </div>

        {/* Right: Facilities Chips (7 cols) */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Facilities Available</span>
          </div>

          {facilities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-[#FCFBF7] rounded-xl border border-amber-200/60 flex items-center gap-2 text-xs text-stone-700 shadow-2xs hover:border-amber-400 transition-colors"
                >
                  {getFacilityIcon(fac)}
                  <span className="truncate font-medium text-[11px]">{fac}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-400 text-xs italic">
              Pilgrim facilities updated on arrival.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitingGuidelines;
