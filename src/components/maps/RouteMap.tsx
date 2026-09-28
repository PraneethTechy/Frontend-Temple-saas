import React, { useMemo, useEffect, useRef, useState, useCallback, type ReactElement } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapPin, Navigation, ExternalLink, Loader2, Satellite } from 'lucide-react';
import {
  getMapTilerApiKey,
  getMapTilerSatelliteStyle,
  getMapTilerHybridStyle,
  getMapTilerStreetsLightStyle,
  createOriginMarkerElement,
  createDestinationMarkerElement,
  type MapStyleTier,
} from '../../utils/mapLibreConfig.js';
import {
  isValidCoordinates,
  getExternalGoogleMapsDirectionsUrl,
  decodePolyline,
} from '../../utils/mapUtils.js';

export interface RoutePoint {
  latitude?: number | string | null;
  longitude?: number | string | null;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface RouteMapProps {
  origin?: RoutePoint | null;
  destination?: RoutePoint | null;
  overviewPolyline?: string | null;
  distanceKm?: number | string | null;
  durationMin?: number | string | null;
  className?: string;
}

type FallbackTier = 'satellite' | 'hybrid' | 'streets-light' | 'fallback-card';

/**
 * Helper to add or update route polyline GeoJSON layers on MapLibre
 */
const addRouteLayersToMap = (map: maplibregl.Map, coords: [number, number][]) => {
  if (coords.length === 0) return;

  if (map.getSource('route')) {
    (map.getSource('route') as maplibregl.GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
    });
    return;
  }

  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
    },
  });

  if (!map.getLayer('route-casing')) {
    map.addLayer({
      id: 'route-casing',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 7,
        'line-opacity': 0.9,
      },
    });
  }

  if (!map.getLayer('route-line')) {
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#2563EB',
        'line-width': 4.5,
        'line-opacity': 1,
      },
    });
  }
};

/**
 * RouteMap (MapLibre GL JS + MapTiler Satellite with 4-Tier Fallback Hierarchy)
 *
 * Fallback Hierarchy:
 * 1. 🛰️ MapTiler SATELLITE (Primary Default)
 * 2. 🌍 MapTiler HYBRID (First Fallback - Satellite + roads/labels)
 * 3. 🗺️ MapTiler STREETS.LIGHT (Second Fallback - Light vector map matching DevaSetu palette)
 * 4. 📍 Premium DevaSetu Location Card (Final Fallback - Clean route destination details with View Map link)
 */
export const RouteMap = ({
  origin,
  destination,
  overviewPolyline,
  distanceKm,
  durationMin,
  className = '',
}: RouteMapProps): ReactElement => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTier, setActiveTier] = useState<FallbackTier>('satellite');
  const activeTierRef = useRef<FallbackTier>('satellite');

  const apiKey = useMemo(() => getMapTilerApiKey(), []);

  // Validation
  const hasOrigin = Boolean(origin && isValidCoordinates(origin.latitude, origin.longitude));
  const hasDest = Boolean(destination && isValidCoordinates(destination.latitude, destination.longitude));

  const originCoords: [number, number] = useMemo(() => {
    return hasOrigin ? [Number(origin!.longitude), Number(origin!.latitude)] : [78.9629, 20.5937];
  }, [hasOrigin, origin]);

  const destCoords: [number, number] = useMemo(() => {
    return hasDest ? [Number(destination!.longitude), Number(destination!.latitude)] : [78.9629, 20.5937];
  }, [hasDest, destination]);

  // Decode route coordinates from Google encoded polyline or straight line
  const routeCoordinates: [number, number][] = useMemo(() => {
    if (overviewPolyline) {
      const decoded = decodePolyline(overviewPolyline);
      if (decoded.length > 0) {
        return decoded.map((pt) => [pt.lng, pt.lat]);
      }
    }

    if (hasOrigin && hasDest) {
      return [originCoords, destCoords];
    }

    return [];
  }, [overviewPolyline, hasOrigin, hasDest, originCoords, destCoords]);

  // External Google Maps directions URL for the action button
  const googleMapsUrl = useMemo(() => {
    return getExternalGoogleMapsDirectionsUrl(origin, destination);
  }, [origin, destination]);

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
          map.once('styledata', () => {
            addRouteLayersToMap(map, routeCoordinates);
          });
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
          map.once('styledata', () => {
            addRouteLayersToMap(map, routeCoordinates);
          });
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
  }, [apiKey, routeCoordinates]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    let isMounted = true;

    if (!hasDest && !hasOrigin) {
      setIsLoading(false);
      return;
    }

    if (!mapContainerRef.current) return;

    setIsLoading(true);
    activeTierRef.current = 'satellite';
    setActiveTier('satellite');

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapTilerSatelliteStyle(apiKey),
        center: destCoords,
        zoom: 7,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add navigation controls at top-left
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');

      map.on('load', () => {
        if (!isMounted) return;
        setIsLoading(false);

        // Add Route Layers
        addRouteLayersToMap(map, routeCoordinates);

        // Fit bounds across origin, destination, and path
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend(originCoords);
        bounds.extend(destCoords);
        routeCoordinates.forEach((coord) => bounds.extend(coord));

        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
          duration: 0,
        });
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

      // Clear previous markers
      if (originMarkerRef.current) originMarkerRef.current.remove();
      if (destMarkerRef.current) destMarkerRef.current.remove();

      // Origin Marker
      const originEl = createOriginMarkerElement();
      const originMarker = new maplibregl.Marker({
        element: originEl,
        anchor: 'bottom',
      })
        .setLngLat(originCoords)
        .addTo(map);

      const originPopup = new maplibregl.Popup({
        offset: 32,
        className: 'devasetu-maplibre-popup',
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1c1917; padding: 2px;">
          <div style="font-weight: 700; color: #047857; margin-bottom: 2px;">📍 Origin</div>
          <div>${origin?.name || origin?.address || 'Starting Location'}</div>
        </div>
      `);
      originMarker.setPopup(originPopup);
      originMarkerRef.current = originMarker;

      // Destination Marker
      const destEl = createDestinationMarkerElement();
      const destMarker = new maplibregl.Marker({
        element: destEl,
        anchor: 'bottom',
      })
        .setLngLat(destCoords)
        .addTo(map);

      const destPopup = new maplibregl.Popup({
        offset: 36,
        className: 'devasetu-maplibre-popup',
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1c1917; padding: 2px;">
          <div style="font-weight: 700; color: #b91c1c; margin-bottom: 2px;">🕉️ Destination Temple</div>
          <div style="font-weight: 600; font-family: serif; color: #78350f;">${destination?.name || 'Sacred Temple'}</div>
          ${
            destination?.address
              ? `<div style="font-size: 11px; color: #78716c; margin-top: 2px;">${destination.address}</div>`
              : ''
          }
          <div style="margin-top: 6px; border-top: 1px solid #fef3c7; padding-top: 4px;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #b45309; font-weight: 600; font-size: 11px; text-decoration: none;">
              Get Turn-by-Turn Navigation ↗
            </a>
          </div>
        </div>
      `);
      destMarker.setPopup(destPopup);
      destMarkerRef.current = destMarker;

      // Robust resize handling
      const resizeTimer = setTimeout(() => {
        map.resize();
      }, 100);

      const handleResize = () => map.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        isMounted = false;
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        if (originMarkerRef.current) originMarkerRef.current.remove();
        if (destMarkerRef.current) destMarkerRef.current.remove();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch {
      if (isMounted) {
        advanceToNextFallbackTier();
      }
    }
  }, [hasOrigin, hasDest, originCoords, destCoords, routeCoordinates, origin, destination, googleMapsUrl, apiKey, advanceToNextFallbackTier]);



  // Tier 4: Premium DevaSetu Location Card Fallback
  if (activeTier === 'fallback-card') {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200/80 shadow-xs bg-[#FAF6EE] min-h-[340px] flex flex-col items-center justify-center p-8 text-center ${className}`}>
        {/* Sacred Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-[#B45309] mb-3 shadow-xs">
          <MapPin className="w-7 h-7 text-amber-700" />
        </div>

        {/* Heritage Badge */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full mb-2 border border-amber-200/60">
          Temple Location
        </span>

        {/* Real Destination Temple Name */}
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1 max-w-lg truncate">
          {destination?.name || 'Temple Destination'}
        </h3>

        {/* Location details */}
        {destination && (
          <p className="text-xs text-stone-600 mb-2 flex items-center gap-1 font-medium">
            <span>📍</span>
            <span>
              {[destination.address].filter(Boolean).join(', ')}
            </span>
          </p>
        )}

        {/* Origin / route context if present */}
        {origin && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-100/80 border border-stone-200/60 text-[11px] text-stone-600 mb-3">
            <span>Starting from: <strong className="text-stone-800">{origin.name || origin.address}</strong></span>
            {distanceKm && <span>• <strong>{distanceKm} km</strong></span>}
            {durationMin && <span>• <strong>{durationMin} min</strong></span>}
          </div>
        )}

        {/* Explicit requested prompt */}
        <p className="text-xs text-stone-500 mb-5 max-w-sm">
          Explore this temple location on the map
        </p>

        {/* Explicit requested [View Map] button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
        >
          <span>View Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Active Map View (Satellite / Hybrid / Streets.Light)
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200/80 shadow-md bg-[#1C1917] ${className}`}>
      {/* MapLibre Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[320px] sm:min-h-[420px]"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Top-Right Satellite Badge */}
      <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-200/90 shadow-md flex items-center gap-1.5 z-10 pointer-events-auto text-xs font-semibold text-amber-900">
        <Satellite className="w-3.5 h-3.5 text-amber-600" />
        <span>Satellite</span>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1C1917]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20 text-white">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs font-serif font-bold text-amber-100">
            Rendering Route Map...
          </span>
          <span className="text-[11px] text-stone-300">
            Connecting origin to sacred temple on map
          </span>
        </div>
      )}

      {/* Empty State when no origin/destination */}
      {!hasOrigin && !hasDest && !isLoading && (
        <div className="absolute inset-0 bg-[#FAF6EE] p-6 flex flex-col items-center justify-center text-center space-y-2 z-10">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-stone-700">Enter your starting location</div>
          <p className="text-[11px] text-stone-500 max-w-xs">
            Provide your origin point above to calculate and render the optimal pilgrimage route.
          </p>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      {hasOrigin && hasDest && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-200/80 shadow-md text-xs font-medium text-stone-700 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
            <span className="truncate max-w-[200px] sm:max-w-xs text-stone-800 font-semibold">
              Pilgrimage Route Active
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md pointer-events-auto transition-colors cursor-pointer"
          >
            <span>Navigate in Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
