import React, { useMemo, useEffect, useRef, useState, useCallback, type ReactElement } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, ExternalLink, Loader2, Satellite } from 'lucide-react';
import {
  getMapTilerApiKey,
  getMapTilerHybridStyle,
  getMapTilerSatelliteStyle,
  getMapTilerStreetsLightStyle,
  createOriginMarkerElement,
  createDestinationMarkerElement,
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

type FallbackTier = 'hybrid' | 'streets-light' | 'fallback-card';

/**
 * RouteMap (MapLibre GL JS + MapTiler Satellite Hybrid)
 *
 * Visual Excellence & Rock-Solid Reliability:
 * - High-res Satellite Hybrid imagery with full geographic place, city, and road labels
 * - Real Google Routes API v2 polyline rendering (no straight lines, no mock coords)
 * - Dual-tone high-contrast path: 8.5px crisp white casing + 5px vibrant saffron-amber (#D97706)
 * - Placed below vector text labels so city and road names remain legible
 * - Multi-hook lifecycle (load, idle, styledata, prop changes) ensuring 100% route visibility
 * - Automatic bounds fitting across the entire route with comfortable padding
 * - High-contrast Origin (green) and Temple Destination (red/gold) markers
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
  const [activeTier, setActiveTier] = useState<FallbackTier>('hybrid');
  const activeTierRef = useRef<FallbackTier>('hybrid');

  const apiKey = useMemo(() => getMapTilerApiKey(), []);

  // Validation
  const hasOrigin = Boolean(origin && isValidCoordinates(origin.latitude, origin.longitude));
  const hasDest = Boolean(destination && isValidCoordinates(destination.latitude, destination.longitude));

  const originCoords: [number, number] = useMemo(() => {
    return hasOrigin
      ? [Number(origin!.longitude), Number(origin!.latitude)]
      : [78.9629, 20.5937];
  }, [hasOrigin, origin?.latitude, origin?.longitude]);

  const destCoords: [number, number] = useMemo(() => {
    return hasDest
      ? [Number(destination!.longitude), Number(destination!.latitude)]
      : [78.9629, 20.5937];
  }, [hasDest, destination?.latitude, destination?.longitude]);

  // Decode real route coordinates from Google encoded polyline (no straight line)
  const routeCoordinates: [number, number][] = useMemo(() => {
    if (overviewPolyline && overviewPolyline.trim().length > 0) {
      const decoded = decodePolyline(overviewPolyline);
      if (decoded.length > 0) {
        return decoded.map((pt) => [pt.lng, pt.lat] as [number, number]);
      }
    }
    return [];
  }, [overviewPolyline]);

  // Keep refs updated for lifecycle callbacks
  const routeCoordinatesRef = useRef<[number, number][]>(routeCoordinates);
  routeCoordinatesRef.current = routeCoordinates;

  const originCoordsRef = useRef<[number, number]>(originCoords);
  originCoordsRef.current = originCoords;

  const destCoordsRef = useRef<[number, number]>(destCoords);
  destCoordsRef.current = destCoords;

  // External directions URL
  const googleMapsUrl = useMemo(() => {
    return getExternalGoogleMapsDirectionsUrl(origin, destination);
  }, [origin, destination]);

  const pendingStyleLoadRef = useRef<boolean>(false);

  /**
   * Core function: Sync route GeoJSON source, layers, and map bounds
   */
  const syncRouteAndBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Guard: If style is still loading, register one listener for style.load
    if (!map.isStyleLoaded()) {
      if (!pendingStyleLoadRef.current) {
        pendingStyleLoadRef.current = true;
        map.once('style.load', () => {
          pendingStyleLoadRef.current = false;
          syncRouteAndBounds();
        });
      }
      return;
    }

    const coords = routeCoordinatesRef.current;
    const oCoords = originCoordsRef.current;
    const dCoords = destCoordsRef.current;

    try {
      const sourceId = 'route-source';
      const casingLayerId = 'route-casing';
      const lineLayerId = 'route-line';

      if (coords.length > 0) {
        const geojsonData = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: coords,
          },
        };

        const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
        if (existingSource) {
          existingSource.setData(geojsonData);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData,
          });
        }

        // Find the first symbol/label layer so the route line stays beneath city text
        let beforeLayerId: string | undefined = undefined;
        const styleLayers = map.getStyle()?.layers;
        if (styleLayers) {
          for (const l of styleLayers) {
            if (l.type === 'symbol') {
              beforeLayerId = l.id;
              break;
            }
          }
        }

        // 1. High-contrast crisp white casing (8.5px) for separation over satellite imagery
        if (!map.getLayer(casingLayerId)) {
          map.addLayer(
            {
              id: casingLayerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#FFFFFF',
                'line-width': 8.5,
                'line-opacity': 0.98,
              },
            },
            beforeLayerId
          );
        }

        // 2. High-contrast sacred saffron-amber core line (5px)
        if (!map.getLayer(lineLayerId)) {
          map.addLayer(
            {
              id: lineLayerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#D97706',
                'line-width': 5,
                'line-opacity': 1,
              },
            },
            beforeLayerId
          );
        }

        // 3. Fit bounds across the complete route path
        const bounds = new maplibregl.LngLatBounds();
        for (let i = 0; i < coords.length; i++) {
          bounds.extend(coords[i]);
        }
        bounds.extend(oCoords);
        bounds.extend(dCoords);

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: { top: 65, bottom: 65, left: 65, right: 65 },
            maxZoom: 15,
            duration: 500,
          });
        }
      } else {
        // Clear route source if empty
        const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
        if (existingSource) {
          existingSource.setData({
            type: 'FeatureCollection',
            features: [],
          });
        }

        // Fit bounds to markers if no route
        const bounds = new maplibregl.LngLatBounds();
        let hasPoints = false;
        if (hasOrigin) {
          bounds.extend(oCoords);
          hasPoints = true;
        }
        if (hasDest) {
          bounds.extend(dCoords);
          hasPoints = true;
        }
        if (hasPoints && !bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: { top: 70, bottom: 70, left: 70, right: 70 },
            maxZoom: 14,
            duration: 400,
          });
        }
      }
    } catch (err) {
      console.warn('[RouteMap] syncRouteAndBounds exception:', err);
    }
  }, [hasOrigin, hasDest]);

  // Fallback Tier Progression
  const advanceToNextFallbackTier = useCallback(() => {
    const current = activeTierRef.current;
    const map = mapInstanceRef.current;

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

    // Final Fallback: Location Card
    activeTierRef.current = 'fallback-card';
    setActiveTier('fallback-card');
    setIsLoading(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [apiKey]);

  // 1. Initialize MapLibre GL Map (Satellite Hybrid as Primary Default)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    setIsLoading(true);

    let map: maplibregl.Map;
    try {
      // Use Satellite Hybrid style: Satellite raster imagery + full place, road, and city labels
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapTilerHybridStyle(apiKey),
        center: destCoords,
        zoom: 8,
        attributionControl: false,
      });
      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('[RouteMap] Map creation error:', err);
      advanceToNextFallbackTier();
      return;
    }

    // Top-left Navigation Controls (Zoom & Compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');

    const handleReady = () => {
      setIsLoading(false);
      syncRouteAndBounds();
    };

    map.on('load', handleReady);
    map.on('style.load', handleReady);
    map.on('idle', handleReady);

    // Only catch fatal auth errors (401/403 on style JSON), ignore individual tile 404s
    map.on('error', (e: any) => {
      const isFatalStyleAuth =
        e?.dataType === 'style' &&
        (e?.error?.status === 401 || e?.error?.status === 403 || String(e?.error?.message).includes('403'));

      if (isFatalStyleAuth) {
        console.warn('[RouteMap] Style auth error, switching to next fallback tier...');
        advanceToNextFallbackTier();
      }
    });

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    // Observe container width changes (e.g. sidebar toggle / panel collapse)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const resizeTimer = setTimeout(handleResize, 250);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. Reactively manage Markers (Origin & Destination)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Origin Marker (Green)
    if (hasOrigin) {
      if (!originMarkerRef.current) {
        const originEl = createOriginMarkerElement();
        const marker = new maplibregl.Marker({
          element: originEl,
          anchor: 'bottom',
        })
          .setLngLat(originCoords)
          .addTo(map);

        const originPopup = new maplibregl.Popup({
          offset: 32,
          className: 'devasetu-maplibre-popup',
        }).setHTML(`
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1c1917; padding: 3px;">
            <div style="font-weight: 700; color: #047857; margin-bottom: 2px;">📍 Starting Location</div>
            <div>${origin?.name || origin?.address || 'Starting Location'}</div>
          </div>
        `);
        marker.setPopup(originPopup);
        originMarkerRef.current = marker;
      } else {
        originMarkerRef.current.setLngLat(originCoords);
      }
    } else if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    // Destination Marker (Sacred Red/Gold Pin)
    if (hasDest) {
      if (!destMarkerRef.current) {
        const destEl = createDestinationMarkerElement();
        const marker = new maplibregl.Marker({
          element: destEl,
          anchor: 'bottom',
        })
          .setLngLat(destCoords)
          .addTo(map);

        const destPopup = new maplibregl.Popup({
          offset: 36,
          className: 'devasetu-maplibre-popup',
        }).setHTML(`
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1c1917; padding: 3px;">
            <div style="font-weight: 700; color: #b91c1c; margin-bottom: 2px;">🕉️ Temple Destination</div>
            <div style="font-weight: 600; font-family: serif; color: #78350f;">${destination?.name || 'Sacred Temple'}</div>
            ${
              destination?.address
                ? `<div style="font-size: 11px; color: #78716c; margin-top: 2px;">${destination.address}</div>`
                : ''
            }
          </div>
        `);
        marker.setPopup(destPopup);
        destMarkerRef.current = marker;
      } else {
        destMarkerRef.current.setLngLat(destCoords);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
  }, [hasOrigin, hasDest, originCoords, destCoords, origin?.name, origin?.address, destination?.name, destination?.address]);

  // 3. Reactively update Route GeoJSON and Fit Bounds when coordinates change
  useEffect(() => {
    syncRouteAndBounds();
  }, [routeCoordinates, originCoords, destCoords, syncRouteAndBounds]);

  // Tier 4: Fallback to Location Card
  if (activeTier === 'fallback-card') {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200/80 shadow-xs bg-[#FAF6EE] min-h-[380px] flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-[#B45309] mb-3 shadow-xs">
          <MapPin className="w-7 h-7 text-amber-700" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full mb-2 border border-amber-200/60">
          Temple Destination
        </span>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1 max-w-lg truncate">
          {destination?.name || 'Temple Destination'}
        </h3>

        {destination?.address && (
          <p className="text-xs text-stone-600 mb-2 flex items-center gap-1 font-medium">
            <span>📍</span>
            <span>{destination.address}</span>
          </p>
        )}

        {origin && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-100/80 border border-stone-200/60 text-[11px] text-stone-600 mb-3">
            <span>From: <strong className="text-stone-800">{origin.name || origin.address}</strong></span>
            {distanceKm && <span>• <strong>{distanceKm} km</strong></span>}
            {durationMin && <span>• <strong>{durationMin} min</strong></span>}
          </div>
        )}

        <p className="text-xs text-stone-500 mb-5 max-w-sm">
          Explore this sacred journey on the map
        </p>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
        >
          <span>Open Navigation</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Active Map View
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200/80 shadow-md bg-[#1C1917] ${className}`}>
      {/* MapLibre Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Top-Right Satellite Hybrid Badge */}
      <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-200/90 shadow-md flex items-center gap-1.5 z-10 pointer-events-auto text-[11px] font-semibold text-amber-900">
        <Satellite className="w-3.5 h-3.5 text-amber-600" />
        <span>Satellite & Labels</span>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1C1917]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20 text-white">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs font-serif font-bold text-amber-100">
            Rendering Route Map...
          </span>
          <span className="text-[11px] text-stone-300">
            Loading satellite imagery and calculating path
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
            Provide your starting location to calculate and visualize your real pilgrimage path.
          </p>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      {hasOrigin && hasDest && (
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-md text-xs font-medium text-stone-700 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
            <span className="truncate text-stone-800 font-semibold text-[11px]">
              {routeCoordinates.length > 0 ? 'Sacred Route Active' : 'Connecting Points'}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-md pointer-events-auto transition-colors cursor-pointer"
          >
            <span>Turn-by-Turn</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
