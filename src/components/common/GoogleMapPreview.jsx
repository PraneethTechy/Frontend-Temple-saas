import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, AlertCircle } from 'lucide-react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader.js';

export const GoogleMapPreview = ({
  latitude,
  longitude,
  templeName = 'Temple',
  address = '',
  city = '',
  state = '',
  mapUrl = '',
  className = '',
}) => {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const hasCoords =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== '' &&
    !isNaN(Number(latitude)) &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== '' &&
    !isNaN(Number(longitude));

  const parsedLat = hasCoords ? Number(latitude) : null;
  const parsedLng = hasCoords ? Number(longitude) : null;

  // External link target for Google Maps
  const externalMapLink =
    mapUrl?.trim() ||
    (hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [templeName, city, state].filter(Boolean).join(', ')
        )}`);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted) return;
        if (!maps || !mapContainerRef.current) {
          setMapError(true);
          return;
        }

        const initializeWithCenter = (centerLatLng) => {
          if (!mapContainerRef.current) return;
          try {
            const map = new maps.Map(mapContainerRef.current, {
              center: centerLatLng,
              zoom: 15,
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: 'cooperative',
              mapId: 'DEVASATU_MAP_PREVIEW',
            });

            new maps.Marker({
              position: centerLatLng,
              map,
              title: templeName,
            });

            if (isMounted) setMapLoaded(true);
          } catch (err) {
            console.warn('Google Maps initialization failed:', err);
            if (isMounted) setMapError(true);
          }
        };

        if (hasCoords) {
          initializeWithCenter({ lat: parsedLat, lng: parsedLng });
        } else if (maps.Geocoder && (templeName || city)) {
          // Geocode using real temple name and city if coordinates not yet saved
          const geocoder = new maps.Geocoder();
          const searchQuery = [templeName, city, state, 'India'].filter(Boolean).join(', ');
          geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (!isMounted) return;
            if (status === 'OK' && results?.[0]?.geometry?.location) {
              initializeWithCenter(results[0].geometry.location);
            } else {
              setMapError(true);
            }
          });
        } else {
          setMapError(true);
        }
      })
      .catch(() => {
        if (isMounted) setMapError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [parsedLat, parsedLng, hasCoords, templeName, city, state]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-amber-200/70 bg-stone-100 flex flex-col justify-between ${className}`}>
      {/* Real Google Maps Container */}
      {!mapError ? (
        <div className="relative w-full h-full min-h-[175px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[175px]" />
          {!mapLoaded && (
            <div className="absolute inset-0 bg-stone-100/90 flex items-center justify-center text-xs text-stone-500 animate-pulse">
              Loading Google Maps...
            </div>
          )}
        </div>
      ) : (
        /* Clean Graceful Fallback Card when API key is missing or map is unavailable */
        <div className="relative w-full h-full min-h-[175px] bg-[#FAF9F5] p-5 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-stone-800">
              Map preview unavailable
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 max-w-xs">
              {[templeName, city, state].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Button: View location on Google Maps */}
      <div className="p-2 bg-white/95 backdrop-blur-xs border-t border-amber-200/60 flex items-center justify-center">
        <a
          href={externalMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors py-1 px-3 rounded-lg hover:bg-amber-50/80 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-600" />
          <span>View location on Google Maps</span>
          <ExternalLink className="w-3 h-3 text-stone-400" />
        </a>
      </div>
    </div>
  );
};

export default GoogleMapPreview;
