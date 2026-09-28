import React, { useEffect, useRef, useState, useMemo, useCallback, type ReactElement } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapPin, Navigation, ExternalLink, Loader2, Satellite } from 'lucide-react';
import {
  getMapTilerApiKey,
  getMapTilerSatelliteStyle,
  getMapTilerHybridStyle,
  getMapTilerStreetsLightStyle,
  createTempleMarkerElement,
  type MapStyleTier,
} from '../../utils/mapLibreConfig.js';
import {
  isValidCoordinates,
  getExternalGoogleMapsSearchUrl,
} from '../../utils/mapUtils.js';

export interface GoogleMapPreviewProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  templeName?: string;
  address?: string;
  city?: string;
  state?: string;
  mapUrl?: string;
  className?: string;
}

type FallbackTier = 'satellite' | 'hybrid' | 'streets-light' | 'fallback-card';

/**
 * GoogleMapPreview (MapLibre GL JS + MapTiler Satellite with 4-Tier Fallback Hierarchy)
 *
 * Fallback Hierarchy:
 * 1. 🛰️ MapTiler SATELLITE (Primary Default)
 * 2. 🌍 MapTiler HYBRID (First Fallback - Satellite + roads/labels)
 * 3. 🗺️ MapTiler STREETS.LIGHT (Second Fallback - Light vector map matching DevaSetu palette)
 * 4. 📍 Premium DevaSetu Location Card (Final Fallback - Clean temple details with View Map link)
 */
export const GoogleMapPreview = ({
  latitude,
  longitude,
  templeName = 'Temple',
  address = '',
  city = '',
  state = '',
  mapUrl = '',
  className = '',
}: GoogleMapPreviewProps): ReactElement => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTier, setActiveTier] = useState<FallbackTier>('satellite');
  const activeTierRef = useRef<FallbackTier>('satellite');

  const apiKey = useMemo(() => getMapTilerApiKey(), []);

  const hasValidLocation = isValidCoordinates(latitude, longitude);
  const parsedLat = hasValidLocation ? Number(latitude) : null;
  const parsedLng = hasValidLocation ? Number(longitude) : null;

  // External link for navigation in Maps
  const externalMapLink = useMemo(() => {
    if (mapUrl?.trim()) return mapUrl.trim();
    const fallback = [templeName, city, state].filter(Boolean).join(', ');
    return getExternalGoogleMapsSearchUrl(parsedLat, parsedLng, fallback);
  }, [mapUrl, parsedLat, parsedLng, templeName, city, state]);

  const locationSummary = [city, state].filter(Boolean).join(', ') || address;

  // Automatic Fallback Progression
  const advanceToNextFallbackTier = useCallback(() => {
    const current = activeTierRef.current;
    const map = mapInstanceRef.current;

    if (current === 'satellite') {
      // Tier 1 -> Tier 2: Switch to Hybrid
      activeTierRef.current = 'hybrid';
      setActiveTier('hybrid');
      if (map) {
        try {
          map.setStyle(getMapTilerHybridStyle(apiKey));
          return;
        } catch {
          advanceToNextFallbackTier();
          return;
        }
      }
    }

    if (current === 'hybrid') {
      // Tier 2 -> Tier 3: Switch to Streets Light
      activeTierRef.current = 'streets-light';
      setActiveTier('streets-light');
      if (map) {
        try {
          map.setStyle(getMapTilerStreetsLightStyle(apiKey));
          return;
        } catch {
          advanceToNextFallbackTier();
          return;
        }
      }
    }

    // Tier 3 -> Tier 4: Switch to Premium DevaSetu Location Card
    activeTierRef.current = 'fallback-card';
    setActiveTier('fallback-card');
    setIsLoading(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [apiKey]);

  useEffect(() => {
    let isMounted = true;

    if (!hasValidLocation || parsedLat === null || parsedLng === null) {
      setIsLoading(false);
      return;
    }

    if (!mapContainerRef.current) return;

    setIsLoading(true);
    activeTierRef.current = 'satellite';
    setActiveTier('satellite');

    try {
      const center: [number, number] = [parsedLng, parsedLat];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapTilerSatelliteStyle(apiKey),
        center,
        zoom: 15,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add navigation controls at top-left
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');

      map.on('load', () => {
        if (!isMounted) return;
        setIsLoading(false);
      });

      // Handle map errors & auto-degrade to next fallback tier without showing error messages
      map.on('error', (e: any) => {
        const status = e?.error?.status;
        const msg = String(e?.error?.message || e?.error || '');
        const isAuthOrNetworkError =
          status === 401 ||
          status === 403 ||
          status === 404 ||
          msg.includes('403') ||
          msg.includes('401') ||
          msg.includes('Forbidden') ||
          (e?.dataType === 'style' && status >= 400);

        if (isAuthOrNetworkError && isMounted) {
          advanceToNextFallbackTier();
        }
      });

      // Clear previous marker
      if (markerRef.current) markerRef.current.remove();

      // Add Temple Marker
      const markerEl = createTempleMarkerElement(false);
      const marker = new maplibregl.Marker({
        element: markerEl,
        anchor: 'bottom',
      })
        .setLngLat(center)
        .addTo(map);

      markerRef.current = marker;

      // Popup
      const popup = new maplibregl.Popup({
        offset: 38,
        closeButton: true,
        className: 'devasetu-maplibre-popup',
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif; color: #1c1917; min-width: 170px;">
          <div style="font-family: serif; font-weight: 700; font-size: 14px; color: #78350f; margin-bottom: 4px; line-height: 1.2;">
            ${templeName}
          </div>
          ${
            locationSummary
              ? `<div style="font-size: 11px; color: #57534e; margin-bottom: 6px;">📍 ${locationSummary}</div>`
              : ''
          }
          <div style="border-top: 1px solid #f5efe6; padding-top: 6px; margin-top: 4px;">
            <a href="${externalMapLink}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #b45309; text-decoration: none;">
              <span>Open in Maps ↗</span>
            </a>
          </div>
        </div>
      `);

      marker.setPopup(popup);

      // Handle resizing
      const resizeTimer = setTimeout(() => {
        map.resize();
      }, 100);

      const handleResize = () => map.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        isMounted = false;
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        if (markerRef.current) markerRef.current.remove();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch {
      if (isMounted) {
        advanceToNextFallbackTier();
      }
    }
  }, [hasValidLocation, parsedLat, parsedLng, templeName, locationSummary, externalMapLink, apiKey, advanceToNextFallbackTier]);



  // Tier 4: Premium DevaSetu Location Card Fallback
  if (activeTier === 'fallback-card' || !hasValidLocation) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200/80 shadow-xs bg-[#FAF6EE] min-h-[240px] flex flex-col items-center justify-center p-6 text-center ${className}`}>
        {/* Sacred Decorative Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-[#B45309] mb-3 shadow-xs">
          <MapPin className="w-6 h-6 text-amber-700" />
        </div>

        {/* Heritage Badge */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full mb-1.5 border border-amber-200/50">
          Temple Location
        </span>

        {/* Real Temple Name */}
        <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-1 max-w-md truncate">
          {templeName || 'Sacred Shrine'}
        </h3>

        {/* City / State geographic context */}
        {locationSummary && (
          <p className="text-xs text-stone-600 mb-2 flex items-center gap-1 font-medium">
            <span>📍</span>
            <span>{locationSummary}</span>
          </p>
        )}

        {/* Explicit requested prompt */}
        <p className="text-xs text-stone-500 mb-4 max-w-sm">
          Explore this temple location on the map
        </p>

        {/* Explicit requested [View Map] button */}
        <a
          href={externalMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
        >
          <span>View Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Active Map View (Satellite / Hybrid / Streets.Light)
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200/80 shadow-xs bg-[#1C1917] ${className}`}>
      {/* MapLibre Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[220px] sm:min-h-[260px]"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Top-Right Satellite Badge */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-200/90 shadow-md flex items-center gap-1.5 z-10 pointer-events-auto text-[11px] font-semibold text-amber-900">
        <Satellite className="w-3 h-3 text-amber-600" />
        <span>Satellite</span>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1C1917]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 text-white">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          <span className="text-xs font-serif font-bold text-amber-100">
            Loading Map Imagery...
          </span>
        </div>
      )}

      {/* Floating Bottom Info Pill */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-200/80 shadow-md text-[11px] font-semibold text-stone-800 pointer-events-auto flex items-center gap-1.5 truncate max-w-[200px]">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="truncate">{templeName}</span>
        </div>

        <a
          href={externalMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold shadow-md pointer-events-auto transition-colors cursor-pointer"
        >
          <span>View Map</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default GoogleMapPreview;
