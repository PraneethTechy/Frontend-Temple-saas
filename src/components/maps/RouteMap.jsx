import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, AlertCircle, Car, Train, Bus, Plane } from 'lucide-react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader.js';

/**
 * RouteMap Component
 *
 * Renders an interactive Google Map with driving route between
 * devotee origin and the booked temple destination.
 */
export const RouteMap = ({
  origin, // { latitude, longitude, formattedAddress, name }
  destination, // { latitude, longitude, formattedAddress, templeName }
  overviewPolyline = '',
  className = '',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const polylineInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [routeFailed, setRouteFailed] = useState(false);

  const hasOrigin = origin && !isNaN(Number(origin.latitude)) && !isNaN(Number(origin.longitude));
  const hasDest = destination && !isNaN(Number(destination.latitude)) && !isNaN(Number(destination.longitude));

  // Construct official Google Maps Directions URL
  const googleMapsUrl =
    hasOrigin && hasDest
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          `${origin.latitude},${origin.longitude}`
        )}&destination=${encodeURIComponent(
          `${destination.latitude},${destination.longitude}`
        )}&travelmode=driving`
      : hasDest
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${destination.latitude},${destination.longitude}`
        )}`
      : '#';

  useEffect(() => {
    let isMounted = true;

    if (!hasOrigin || !hasDest) {
      return;
    }

    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted) return;
        if (!maps || !mapContainerRef.current) {
          setMapError(true);
          return;
        }

        try {
          // Initialize map instance once if not already initialized
          if (!mapInstanceRef.current) {
            const map = new maps.Map(mapContainerRef.current, {
              center: { lat: Number(destination.latitude), lng: Number(destination.longitude) },
              zoom: 7,
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: 'cooperative',
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'simplified' }],
                },
              ],
            });
            mapInstanceRef.current = map;
          }

          const map = mapInstanceRef.current;

          // Clear previous renderers and markers
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
          }
          if (polylineInstanceRef.current) {
            polylineInstanceRef.current.setMap(null);
          }
          markersRef.current.forEach((m) => m.setMap(null));
          markersRef.current = [];

          const originLatLng = { lat: Number(origin.latitude), lng: Number(origin.longitude) };
          const destLatLng = { lat: Number(destination.latitude), lng: Number(destination.longitude) };

          const addCustomMarkers = () => {
            const originMarker = new maps.Marker({
              position: originLatLng,
              map,
              title: origin.name || origin.formattedAddress || 'Your Starting Point',
              icon: {
                path: maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#16A34A',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2.5,
              },
            });

            const destMarker = new maps.Marker({
              position: destLatLng,
              map,
              title: destination.templeName || 'Temple Destination',
              icon: {
                path: maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: '#DC2626',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2.5,
              },
            });

            markersRef.current = [originMarker, destMarker];
          };

          // Option A: If overviewPolyline is available from backend Google Routes API
          if (overviewPolyline && maps.geometry?.encoding?.decodePath) {
            const path = maps.geometry.encoding.decodePath(overviewPolyline);
            const polyline = new maps.Polyline({
              path,
              geodesic: true,
              strokeColor: '#2563EB',
              strokeOpacity: 0.85,
              strokeWeight: 5,
              map,
            });
            polylineInstanceRef.current = polyline;

            const bounds = new maps.LatLngBounds();
            path.forEach((latLng) => bounds.extend(latLng));
            map.fitBounds(bounds, 50);

            addCustomMarkers();
            setMapLoaded(true);
            setRouteFailed(false);
            return;
          }

          // Option B: Directions Service for rendering interactive road route
          const directionsService = new maps.DirectionsService();
          const directionsRenderer = new maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2563EB',
              strokeWeight: 5,
              strokeOpacity: 0.85,
            },
          });
          directionsRendererRef.current = directionsRenderer;

          const request = {
            origin: originLatLng,
            destination: destLatLng,
            travelMode: maps.TravelMode.DRIVING,
          };

          directionsService.route(request, (result, status) => {
            if (!isMounted) return;

            if (status === maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);
              addCustomMarkers();
              setMapLoaded(true);
              setRouteFailed(false);
            } else {
              console.warn('[RouteMap] Directions request fallback to bounds:', status);
              const bounds = new maps.LatLngBounds();
              bounds.extend(originLatLng);
              bounds.extend(destLatLng);
              map.fitBounds(bounds, 50);

              // Draw straight connection line as fallback
              const polyline = new maps.Polyline({
                path: [originLatLng, destLatLng],
                geodesic: true,
                strokeColor: '#2563EB',
                strokeOpacity: 0.7,
                strokeWeight: 4,
                map,
              });
              polylineInstanceRef.current = polyline;

              addCustomMarkers();
              setMapLoaded(true);
              setRouteFailed(false);
            }
          });
        } catch (err) {
          console.warn('[RouteMap] Map initialization error:', err);
          if (isMounted) setMapError(true);
        }
      })
      .catch(() => {
        if (isMounted) setMapError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
    overviewPolyline,
  ]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-amber-200/80 bg-stone-100 min-h-[320px] sm:min-h-[420px] flex flex-col justify-between ${className}`}>
      {/* Real Interactive Map Canvas */}
      {!mapError ? (
        <div className="relative w-full h-full min-h-[320px] sm:min-h-[420px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[320px] sm:min-h-[420px]" />

          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-stone-100/90 flex flex-col items-center justify-center gap-2 text-xs text-stone-500 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
              <span>Loading route map...</span>
            </div>
          )}


          {/* View in Google Maps Button Overlay */}
          <div className="absolute bottom-3 left-3 z-10">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-stone-200 shadow-md rounded-xl text-xs font-semibold text-stone-800 hover:text-amber-800 hover:bg-white transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              <span>View in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>
        </div>
      ) : (
        /* Graceful Fallback Card when Google Maps is offline or key missing */
        <div className="w-full h-full min-h-[320px] p-6 bg-[#FAF9F5] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="max-w-xs space-y-1">
            <h4 className="text-sm font-serif font-bold text-stone-800">
              Interactive Route Map
            </h4>
            <p className="text-xs text-stone-500">
              Google Maps is currently unavailable. Your calculated route details and timing schedule remain accurate.
            </p>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Route in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
