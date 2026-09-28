import React, { useEffect, useRef, useState, useCallback, useMemo, type ReactElement } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Satellite,
  ExternalLink,
} from 'lucide-react';
import {
  getMapTilerApiKey,
  getMapTilerSatelliteStyle,
  getMapTilerHybridStyle,
  getMapTilerStreetsLightStyle,
  type MapStyleTier,
} from '../../utils/mapLibreConfig.js';
import {
  isValidCoordinates,
  getExternalGoogleMapsSearchUrl,
} from '../../utils/mapUtils.js';

export interface LocationPickerValue {
  latitude: number;
  longitude: number;
  mapUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export type LocationSelectData = LocationPickerValue;

export interface GoogleMapLocationPickerProps {
  initialLatitude?: number | string | null;
  initialLongitude?: number | string | null;
  initialMapUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  mapUrl?: string | null;
  templeName?: string;
  onLocationSelect?: (location: LocationPickerValue) => void;
  className?: string;
}

type FallbackTier = 'satellite' | 'hybrid' | 'streets-light' | 'fallback-card';

/**
 * High-contrast Draggable Pin for MapLibre Location Picker
 */
const createDraggablePickerMarkerElement = (): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'devasetu-picker-marker select-none cursor-grab active:cursor-grabbing';
  container.style.width = '38px';
  container.style.height = '48px';
  container.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 48" width="38" height="48" fill="none">
      <defs>
        <filter id="pickShadow" x="-25%" y="-15%" width="150%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        <linearGradient id="pickGrad" x1="0" y1="0" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FB923C"/>
          <stop offset="50%" stop-color="#EA580C"/>
          <stop offset="100%" stop-color="#C2410C"/>
        </linearGradient>
      </defs>
      <g filter="url(#pickShadow)">
        <path d="M19 2C9.61 2 2 9.61 2 19c0 13.5 15.4 27 16.2 27.7a1.2 1.2 0 001.6 0C20.6 46 36 32.5 36 19c0-9.39-7.61-17-17-17z"
              fill="url(#pickGrad)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="19" cy="18" r="9.5" fill="#FFF7ED"/>
        <circle cx="19" cy="18" r="4.5" fill="#C2410C"/>
      </g>
    </svg>
  `;
  return container;
};

/**
 * GoogleMapLocationPicker (MapLibre GL JS + MapTiler Satellite with 4-Tier Fallback Hierarchy)
 *
 * Fallback Hierarchy:
 * 1. 🛰️ MapTiler SATELLITE (Primary Default)
 * 2. 🌍 MapTiler HYBRID (First Fallback - Satellite + roads/labels)
 * 3. 🗺️ MapTiler STREETS.LIGHT (Second Fallback - Light vector map matching DevaSetu palette)
 * 4. 📍 Premium DevaSetu Location Card (Final Fallback - Clean temple details with View Map link)
 */
export const GoogleMapLocationPicker = ({
  initialLatitude,
  initialLongitude,
  initialMapUrl = '',
  latitude,
  longitude,
  mapUrl,
  templeName = '',
  onLocationSelect,
  className = '',
}: GoogleMapLocationPickerProps): ReactElement => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const effectiveLat = latitude !== undefined ? latitude : initialLatitude;
  const effectiveLng = longitude !== undefined ? longitude : initialLongitude;
  const effectiveMapUrl = (mapUrl !== undefined ? mapUrl : initialMapUrl) || '';

  const initialValid = isValidCoordinates(effectiveLat, effectiveLng);
  const defaultLat = initialValid ? Number(effectiveLat) : 20.5937; // Default India center
  const defaultLng = initialValid ? Number(effectiveLng) : 78.9629;

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });

  const [hasValidCoords, setHasValidCoords] = useState<boolean>(initialValid);
  const [latInput, setLatInput] = useState<string>(initialValid ? String(effectiveLat) : '');
  const [lngInput, setLngInput] = useState<string>(initialValid ? String(effectiveLng) : '');
  const [manualInputError, setManualInputError] = useState<string>('');
  const [selectionNotice, setSelectionNotice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTier, setActiveTier] = useState<FallbackTier>('satellite');
  const activeTierRef = useRef<FallbackTier>('satellite');

  const apiKey = useMemo(() => getMapTilerApiKey(), []);

  // Sync external props if they change
  useEffect(() => {
    if (isValidCoordinates(effectiveLat, effectiveLng)) {
      const lat = Number(effectiveLat);
      const lng = Number(effectiveLng);
      setSelectedCoords({ lat, lng });
      setLatInput(String(lat));
      setLngInput(String(lng));
      setHasValidCoords(true);

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15 });
      }
    }
  }, [effectiveLat, effectiveLng]);

  // Update selected position
  const handleUpdateCoordinates = useCallback(
    (lat: number, lng: number, label = 'Location Selected') => {
      const cleanLat = Number(lat.toFixed(6));
      const cleanLng = Number(lng.toFixed(6));

      setSelectedCoords({ lat: cleanLat, lng: cleanLng });
      setLatInput(String(cleanLat));
      setLngInput(String(cleanLng));
      setHasValidCoords(true);
      setManualInputError('');

      const generatedMapUrl = getExternalGoogleMapsSearchUrl(cleanLat, cleanLng);

      onLocationSelect?.({
        latitude: cleanLat,
        longitude: cleanLng,
        mapUrl: generatedMapUrl,
      });

      setSelectionNotice(`${label}: ${cleanLat}, ${cleanLng}`);
    },
    [onLocationSelect]
  );

  // Automatic Fallback Progression
  const advanceToNextFallbackTier = useCallback(() => {
    const current = activeTierRef.current;
    const map = mapInstanceRef.current;

    if (current === 'satellite') {
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

    // Tier 4: Fallback to Premium Location Card
    activeTierRef.current = 'fallback-card';
    setActiveTier('fallback-card');
    setIsLoading(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [apiKey]);

  // Initialize MapLibre Map
  useEffect(() => {
    let isMounted = true;

    if (!mapContainerRef.current) return;

    setIsLoading(true);
    activeTierRef.current = 'satellite';
    setActiveTier('satellite');

    try {
      const center: [number, number] = [selectedCoords.lng, selectedCoords.lat];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapTilerSatelliteStyle(apiKey),
        center,
        zoom: hasValidCoords ? 15 : 6,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');

      map.on('load', () => {
        if (!isMounted) return;
        setIsLoading(false);
      });

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

      // Draggable Marker
      const markerEl = createDraggablePickerMarkerElement();
      const marker = new maplibregl.Marker({
        element: markerEl,
        anchor: 'bottom',
        draggable: true,
      })
        .setLngLat(center)
        .addTo(map);

      markerRef.current = marker;

      // Click on map moves marker
      map.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        handleUpdateCoordinates(lat, lng, 'Map pin placed');
      });

      // Dragging marker updates coordinates
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        handleUpdateCoordinates(lngLat.lat, lngLat.lng, 'Pin adjusted');
      });

      // Resize
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
  }, [hasValidCoords, apiKey, handleUpdateCoordinates, advanceToNextFallbackTier]);

  // Manual Coordinates Apply
  const handleApplyManualInput = () => {
    const lat = parseFloat(latInput.trim());
    const lng = parseFloat(lngInput.trim());

    if (isNaN(lat) || isNaN(lng) || !isValidCoordinates(lat, lng)) {
      setManualInputError('Please enter valid coordinates (-90 to 90 lat, -180 to 180 lng)');
      return;
    }

    handleUpdateCoordinates(lat, lng, 'Manual coordinates applied');

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: 15 });
    }
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  };

  const externalMapLink = useMemo(() => {
    return getExternalGoogleMapsSearchUrl(selectedCoords.lat, selectedCoords.lng, templeName);
  }, [selectedCoords, templeName]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Card */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border border-amber-200/80 shadow-md bg-[#FAF6EE]">
        {activeTier === 'fallback-card' ? (
          /* Tier 4: Premium DevaSetu Location Card Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF6EE] relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-[#B45309] mb-3 shadow-xs">
              <MapPin className="w-7 h-7 text-amber-700" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full mb-2 border border-amber-200/60">
              Temple Location
            </span>

            <h3 className="text-xl font-serif font-bold text-stone-900 mb-1 max-w-lg truncate">
              {templeName || 'Temple Location'}
            </h3>

            {hasValidCoords && (
              <p className="text-xs text-stone-600 mb-2 flex items-center gap-1 font-mono">
                <span>📍</span>
                <span>{selectedCoords.lat}, {selectedCoords.lng}</span>
              </p>
            )}

            <p className="text-xs text-stone-500 mb-4 max-w-sm">
              Explore this temple location on the map
            </p>

            <a
              href={externalMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
            >
              <span>View Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <>
            {/* MapLibre Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full h-full bg-[#1C1917]"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Floating Top-Right Satellite Badge */}
            <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-200/90 shadow-md flex items-center gap-1.5 z-10 pointer-events-auto text-xs font-semibold text-amber-900">
              <Satellite className="w-3.5 h-3.5 text-amber-600" />
              <span>Satellite</span>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-[#1C1917]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20 text-white">
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                <span className="text-xs font-serif font-bold text-amber-100">
                  Initializing Map Canvas...
                </span>
              </div>
            )}

            {/* Floating Instruction Banner */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-200/90 shadow-md text-xs font-medium text-stone-700 pointer-events-auto flex items-center gap-1.5 z-10">
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              <span>Click anywhere or drag the pin to position your temple</span>
            </div>
          </>
        )}
      </div>

      {/* Manual Coordinates Input Strip */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Latitude
            </label>
            <input
              type="text"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="e.g. 12.2319"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Longitude
            </label>
            <input
              type="text"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              placeholder="e.g. 79.0677"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyManualInput}
            className="w-full sm:w-auto self-end px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Apply Pin
          </button>
        </div>

        {/* Notices & Errors */}
        {selectionNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{selectionNotice}</span>
          </div>
        )}

        {manualInputError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{manualInputError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapLocationPicker;
