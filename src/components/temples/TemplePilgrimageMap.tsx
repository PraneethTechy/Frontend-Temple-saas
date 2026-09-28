import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import { MapPin, ArrowRight, Loader2, RotateCcw, Satellite, ExternalLink } from 'lucide-react';
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
import type { Temple } from '@shared/types/index.js';

export interface TemplePilgrimageMapProps {
  temples: Temple[];
  getTempleImage: (temple: Temple) => string | null | undefined;
  getTempleBadge: (temple: Temple) => string;
}

type FallbackTier = 'satellite' | 'hybrid' | 'streets-light' | 'fallback-card';

/**
 * TemplePilgrimageMap (MapLibre GL JS + MapTiler Satellite with 4-Tier Fallback Hierarchy)
 *
 * Fallback Hierarchy:
 * 1. 🛰️ MapTiler SATELLITE (Primary Default)
 * 2. 🌍 MapTiler HYBRID (First Fallback - Satellite + roads/labels)
 * 3. 🗺️ MapTiler STREETS.LIGHT (Second Fallback - Light vector map matching DevaSetu palette)
 * 4. 📍 Premium DevaSetu Location Card (Final Fallback - Clean temple details with View Map link)
 */
export const TemplePilgrimageMap: React.FC<TemplePilgrimageMapProps> = ({
  temples,
  getTempleImage,
  getTempleBadge,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersMapRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<FallbackTier>('satellite');
  const activeTierRef = useRef<FallbackTier>('satellite');

  const apiKey = useMemo(() => getMapTilerApiKey(), []);

  // Filter temples with valid geographic coordinates
  const templesWithCoords = useMemo(() => {
    return temples.filter((t) => isValidCoordinates(t.latitude, t.longitude));
  }, [temples]);

  // Currently focused temple for the location card or details
  const currentTemple = useMemo(() => {
    if (selectedTempleId) {
      const match = templesWithCoords.find((t) => String(t._id) === selectedTempleId);
      if (match) return match;
    }
    return templesWithCoords[0] || temples[0] || null;
  }, [selectedTempleId, templesWithCoords, temples]);

  // Compute bounding box across all shrines
  const bounds = useMemo(() => {
    if (templesWithCoords.length === 0) return null;
    const b = new maplibregl.LngLatBounds();
    templesWithCoords.forEach((t) => {
      b.extend([Number(t.longitude), Number(t.latitude)]);
    });
    return b;
  }, [templesWithCoords]);

  // Fit all shrines in view
  const fitAllBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (map && bounds && !bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15,
        duration: 800,
      });
    }
  }, [bounds]);

  // Open Popup for a specific temple
  const openTemplePopup = useCallback(
    (temple: Temple, map: maplibregl.Map) => {
      if (popupRef.current) {
        popupRef.current.remove();
      }

      const imgUrl = getTempleImage(temple);
      const badge = getTempleBadge(temple);
      const viewUrl = `/temples/${temple.slug || temple._id}`;
      const extMapUrl =
        temple.mapUrl ||
        getExternalGoogleMapsSearchUrl(temple.latitude, temple.longitude, temple.name);

      const content = `
        <div style="font-family: system-ui, -apple-system, sans-serif; color: #1c1917; max-width: 250px;">
          ${
            imgUrl
              ? `<div style="width: 100%; height: 105px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #e7e5e4; position: relative;">
                  <img src="${imgUrl}" alt="${temple.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
                </div>`
              : ''
          }
          <div style="display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 9999px; margin-bottom: 5px; border: 1px solid #fde68a;">
            ${badge}
          </div>
          <h4 style="font-family: serif; font-weight: 700; font-size: 15px; color: #78350f; margin: 0 0 4px 0; line-height: 1.25;">
            ${temple.name}
          </h4>
          <p style="font-size: 11px; color: #57534e; margin: 0 0 10px 0; display: flex; align-items: center; gap: 4px;">
            📍 ${temple.city}, ${temple.state}
          </p>
          <div style="border-top: 1px solid #f5efe6; padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <a href="${viewUrl}" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #ffffff; text-decoration: none; background: #b45309; padding: 6px 12px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              <span>View Details →</span>
            </a>
            <a href="${extMapUrl}" target="_blank" rel="noopener noreferrer" title="Open in Maps" style="color: #78716c; padding: 4px; display: inline-flex; align-items: center;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 38,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '280px',
        className: 'devasetu-maplibre-popup',
      })
        .setLngLat([Number(temple.longitude), Number(temple.latitude)])
        .setHTML(content)
        .addTo(map);

      popupRef.current = popup;
    },
    [getTempleImage, getTempleBadge]
  );

  // Focus a specific temple marker and highlight in roster
  const selectTemple = useCallback(
    (temple: Temple, panMap = true) => {
      const id = String(temple._id);
      setSelectedTempleId(id);

      const map = mapInstanceRef.current;
      if (!map) return;

      templesWithCoords.forEach((t) => {
        const marker = markersMapRef.current.get(String(t._id));
        if (marker) {
          const isTarget = String(t._id) === id;
          const el = marker.getElement();
          el.innerHTML = createTempleMarkerElement(isTarget).innerHTML;
          el.style.width = isTarget ? '44px' : '36px';
          el.style.height = isTarget ? '56px' : '46px';
        }
      });

      if (panMap) {
        map.flyTo({
          center: [Number(temple.longitude), Number(temple.latitude)],
          zoom: Math.max(map.getZoom(), 14),
          speed: 1.2,
          curve: 1.4,
        });
      }

      openTemplePopup(temple, map);

      // Scroll the corresponding roster card into view
      const itemEl = itemRefs.current.get(id);
      if (itemEl) {
        itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [openTemplePopup, templesWithCoords]
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

  // Initialize MapLibre GL Map
  useEffect(() => {
    let isMounted = true;

    if (templesWithCoords.length === 0) {
      setIsLoading(false);
      return;
    }

    if (!mapContainerRef.current) return;

    setIsLoading(true);
    activeTierRef.current = 'satellite';
    setActiveTier('satellite');

    try {
      const firstTemple = templesWithCoords[0];
      const initialCenter: [number, number] = [
        Number(firstTemple.longitude),
        Number(firstTemple.latitude),
      ];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapTilerSatelliteStyle(apiKey),
        center: initialCenter,
        zoom: templesWithCoords.length === 1 ? 14 : 7,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add navigation controls at top-left
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');

      map.on('load', () => {
        if (!isMounted) return;
        setIsLoading(false);

        // Fit bounds to show all shrines
        if (bounds && templesWithCoords.length > 1) {
          map.fitBounds(bounds, {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            duration: 0,
          });
        }
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

      // Clear existing markers
      markersMapRef.current.forEach((m) => m.remove());
      markersMapRef.current.clear();

      // Render temple markers
      templesWithCoords.forEach((temple) => {
        const isSelected = selectedTempleId === String(temple._id);
        const markerEl = createTempleMarkerElement(isSelected);

        const marker = new maplibregl.Marker({
          element: markerEl,
          anchor: 'bottom',
        })
          .setLngLat([Number(temple.longitude), Number(temple.latitude)])
          .addTo(map);

        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          selectTemple(temple, false);
        });

        markersMapRef.current.set(String(temple._id), marker);
      });

      // Periodic resize check to guarantee canvas fills 100% container
      const resizeTimer = setTimeout(() => {
        map.resize();
      }, 100);

      const handleWindowResize = () => {
        map.resize();
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        isMounted = false;
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleWindowResize);
        markersMapRef.current.forEach((m) => m.remove());
        markersMapRef.current.clear();
        if (popupRef.current) popupRef.current.remove();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch {
      if (isMounted) {
        advanceToNextFallbackTier();
      }
    }
  }, [templesWithCoords, bounds, apiKey, selectTemple, advanceToNextFallbackTier]);



  const currentExternalMapLink = useMemo(() => {
    if (!currentTemple) return '#';
    if (currentTemple.mapUrl?.trim()) return currentTemple.mapUrl.trim();
    return getExternalGoogleMapsSearchUrl(
      currentTemple.latitude,
      currentTemple.longitude,
      currentTemple.name
    );
  }, [currentTemple]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ========================================================
          LEFT COLUMN: MAP CANVAS OR PREMIUM LOCATION CARD (8 COLS ON DESKTOP)
          ======================================================== */}
      <div className="lg:col-span-8 relative w-full h-[480px] sm:h-[520px] lg:h-[580px] rounded-3xl overflow-hidden border border-amber-200/80 shadow-lg bg-[#FAF6EE]">
        {activeTier === 'fallback-card' ? (
          /* Tier 4: Premium DevaSetu Location Card Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#FAF6EE] relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-[#B45309] mb-3 shadow-xs">
              <MapPin className="w-7 h-7 text-amber-700" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full mb-2 border border-amber-200/60">
              Temple Location
            </span>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1 max-w-lg truncate">
              {currentTemple ? currentTemple.name : 'Pilgrimage Shrines'}
            </h3>

            {currentTemple && (
              <p className="text-xs text-stone-600 mb-2 flex items-center gap-1 font-medium">
                <span>📍</span>
                <span>
                  {currentTemple.city}, {currentTemple.state}
                </span>
              </p>
            )}

            <p className="text-xs text-stone-500 mb-5 max-w-sm">
              Explore this temple location on the map
            </p>

            <a
              href={currentExternalMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
            >
              <span>View Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Note that roster on right allows switching shrines */}
            <p className="text-[11px] text-stone-400 mt-4">
              Select any shrine from the directory to inspect its pilgrimage location
            </p>
          </div>
        ) : templesWithCoords.length > 0 ? (
          <>
            {/* MapLibre WebGL Canvas Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-full min-h-[480px] bg-[#1C1917]"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Floating Top-Right Satellite Badge */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-200/90 shadow-md flex items-center gap-1.5 z-10 pointer-events-auto text-xs font-semibold text-amber-900">
              <Satellite className="w-3.5 h-3.5 text-amber-600" />
              <span>Satellite</span>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-[#1C1917]/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 text-white">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-sm font-serif font-bold text-amber-100">
                  Loading Pilgrimage Map...
                </span>
              </div>
            )}

            {/* Bottom Floating Legend / Badge */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-200/90 shadow-md flex items-center gap-3 text-xs font-medium text-stone-700 z-10 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300 animate-pulse" />
                <span className="font-semibold text-stone-800">
                  {templesWithCoords.length} Shrines on Map
                </span>
              </div>

              {templesWithCoords.length > 1 && (
                <button
                  type="button"
                  onClick={fitAllBounds}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#B45309] hover:text-[#78350F] border-l border-stone-200 pl-3 transition-colors cursor-pointer"
                  title="Fit all shrines in view"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset View</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* Graceful Empty State when no temples have coordinates */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#B45309] mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-800">
              No Shrine Coordinates Available
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Temples matching this filter criteria do not currently have verified map coordinates.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          RIGHT COLUMN: SHRINES DIRECTORY ROSTER (4 COLS ON DESKTOP)
          Dedicated custom scrollbar with synchronized card selection
          ======================================================== */}
      <div className="lg:col-span-4 flex flex-col h-[480px] sm:h-[520px] lg:h-[580px] rounded-3xl border border-amber-200/80 bg-white/90 backdrop-blur-md shadow-md overflow-hidden">
        {/* Roster Header */}
        <div className="px-5 py-3.5 border-b border-amber-100 bg-[#FCFBF7] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-serif font-bold text-stone-900 tracking-wide uppercase">
              Pilgrimage Directory
            </h3>
            <p className="text-[11px] text-stone-500">
              Showing {templesWithCoords.length} verified sacred sites
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/60">
            {temples.length} Total
          </span>
        </div>

        {/* Roster Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y-0 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
          {temples.map((temple) => {
            const isSelected = selectedTempleId === String(temple._id);
            const imgUrl = getTempleImage(temple);
            const badge = getTempleBadge(temple);
            const viewUrl = `/temples/${temple.slug || temple._id}`;

            return (
              <div
                key={String(temple._id)}
                ref={(el) => {
                  if (el) itemRefs.current.set(String(temple._id), el);
                  else itemRefs.current.delete(String(temple._id));
                }}
                onClick={() => selectTemple(temple, true)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 items-center ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-1 ring-amber-400'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF6EE]/60'
                }`}
              >
                {/* Temple Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60 relative">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={temple.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-700 bg-amber-50">
                      <MapPin className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      {badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-stone-900 truncate">
                    {temple.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                    <span>📍</span>
                    <span>
                      {temple.city}, {temple.state}
                    </span>
                  </p>
                </div>

                {/* Action Link */}
                <Link
                  to={viewUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl text-stone-400 hover:text-amber-800 hover:bg-amber-100/60 transition-colors"
                  title="View Temple Profile"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplePilgrimageMap;
