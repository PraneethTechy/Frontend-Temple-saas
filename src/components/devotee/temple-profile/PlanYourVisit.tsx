import React from 'react';
import {
  Compass,
  MapPin,
  Car,
  Navigation,
  Phone,
  Landmark,
} from 'lucide-react';
import GoogleMapPreview from '../../common/GoogleMapPreview';
import type { Temple, HowToReach, NearbyPlace } from '@shared/types/index.js';

export interface PlanYourVisitTemple extends Partial<Temple> {
  howToReach?: HowToReach;
  nearbyPlaces?: NearbyPlace[];
}

export interface PlanYourVisitProps {
  temple: PlanYourVisitTemple;
}

export const PlanYourVisit: React.FC<PlanYourVisitProps> = ({ temple }) => {
  const howToReachText =
    [
      temple?.howToReach?.byRoad,
      temple?.howToReach?.byTrain,
      temple?.howToReach?.byAir,
    ]
      .filter(Boolean)
      .join(' ') ||
    `Well connected by road and rail to major cities across ${temple?.state || 'the region'}.`;

  const nearbyPlaces = Array.isArray(temple?.nearbyPlaces)
    ? temple.nearbyPlaces.filter((p) => p.name?.trim())
    : [];

  return (
    <div id="plan-section" className="spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
          <Compass className="w-3.5 h-3.5" />
        </div>
        <h2 className="font-serif font-bold text-base sm:text-lg text-stone-800">
          Plan Your Visit
        </h2>
      </div>

      {/* 2-Column Split: Map on Left, Details on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Google Map Preview (5 cols) */}
        <div className="md:col-span-5 h-[220px]">
          <GoogleMapPreview
            latitude={temple.latitude}
            longitude={temple.longitude}
            templeName={temple.name}
            address={temple.address}
            city={temple.city}
            state={temple.state}
            mapUrl={temple.mapUrl}
            className="w-full h-full"
          />
        </div>

        {/* Right: Key Visit Information (7 cols) */}
        <div className="md:col-span-7 space-y-3 text-xs">
          {/* Address */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <MapPin className="w-3 h-3" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block text-[11px]">Address</span>
              <p className="text-stone-600 leading-snug">
                {temple.address ? `${temple.address}, ` : ''}{temple.city ? `${temple.city}, ` : ''}{temple.state ? `${temple.state}` : ''}{temple.pincode ? ` - ${temple.pincode}` : ''}
              </p>
            </div>
          </div>

          {/* How to Reach */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <Navigation className="w-3 h-3" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block text-[11px]">How to Reach</span>
              <p className="text-stone-600 leading-snug line-clamp-2">
                {howToReachText}
              </p>
            </div>
          </div>

          {/* Nearby Places */}
          {nearbyPlaces.length > 0 && (
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Landmark className="w-3 h-3" />
              </div>
              <div>
                <span className="font-semibold text-stone-800 block text-[11px]">Nearby Places</span>
                <p className="text-stone-600 leading-snug">
                  {nearbyPlaces.slice(0, 3).map((p) => p.name).join(' · ')}
                </p>
              </div>
            </div>
          )}

          {/* Parking & Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-100/70">
            {temple.parking && (
              <div className="flex items-start gap-2">
                <Car className="w-3 h-3 text-amber-700 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-stone-800 block text-[10px]">Parking</span>
                  <p className="text-stone-600 truncate">{temple.parking}</p>
                </div>
              </div>
            )}

            {temple.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-3 h-3 text-amber-700 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-stone-800 block text-[10px]">Contact</span>
                  <a href={`tel:${temple.phone}`} className="text-amber-800 hover:underline truncate block">
                    {temple.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanYourVisit;
