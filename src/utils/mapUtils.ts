/**
 * DevaSetu Google Maps Utility Helpers
 * Centralized coordinate validation, URL builders, polyline decoders,
 * and SVG marker definitions for the unified Google Maps experience.
 */

export interface GeoCoordinate {
  latitude?: number | string | null;
  longitude?: number | string | null;
}

/**
 * Validates that latitude and longitude are valid finite numbers within geographical bounds:
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export const isValidCoordinates = (lat: unknown, lng: unknown): boolean => {
  if (lat === null || lat === undefined || lat === '' || isNaN(Number(lat))) {
    return false;
  }
  if (lng === null || lng === undefined || lng === '' || isNaN(Number(lng))) {
    return false;
  }
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  return (
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180
  );
};

/**
 * Constructs an external Google Maps search URL (opens in new tab)
 */
export const getExternalGoogleMapsSearchUrl = (
  lat: unknown,
  lng: unknown,
  fallbackQuery = ''
): string => {
  if (isValidCoordinates(lat, lng)) {
    return `https://www.openstreetmap.org/?mlat=${Number(lat)}&mlon=${Number(lng)}#map=16/${Number(lat)}/${Number(lng)}`;
  }
  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(fallbackQuery.trim())}`;
  }
  return 'https://www.openstreetmap.org';
};

export interface RouteCoordinateTarget {
  latitude?: number | string | null;
  longitude?: number | string | null;
}

/**
 * Constructs an external map directions URL (OpenStreetMap)
 */
export const getExternalGoogleMapsDirectionsUrl = (
  origin?: RouteCoordinateTarget | null,
  destination?: RouteCoordinateTarget | null
): string => {
  const hasOrigin = origin && isValidCoordinates(origin.latitude, origin.longitude);
  const hasDest = destination && isValidCoordinates(destination.latitude, destination.longitude);

  if (hasOrigin && hasDest) {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(
      `${origin.latitude},${origin.longitude};${destination.latitude},${destination.longitude}`
    )}`;
  }

  if (hasDest) {
    return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
      String(destination.latitude)
    )}&mlon=${encodeURIComponent(String(destination.longitude))}#map=16/${encodeURIComponent(
      String(destination.latitude)
    )}/${encodeURIComponent(String(destination.longitude))}`;
  }

  return 'https://www.openstreetmap.org';
};

/**
 * Decodes a Google-encoded polyline string into an array of { lat, lng } points for Google Maps Polyline.
 */
export const decodePolyline = (encoded?: string | null): { lat: number; lng: number }[] => {
  if (!encoded || typeof encoded !== 'string') return [];
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  try {
    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
  } catch (err) {
    console.warn('[MapUtils] Polyline decode error:', err);
    return [];
  }

  return points;
};

// SVG Marker Data URIs for crisp rendering in Google Maps
// Innovative circular medallion pins with sacred Gopuram motif & golden jewel rim

export const TEMPLE_MARKER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 44" width="34" height="44" fill="none">
  <defs>
    <filter id="pinShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#451A03" flood-opacity="0.38"/>
    </filter>
    <linearGradient id="pinGrad" x1="0" y1="0" x2="34" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="45%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#991B1B"/>
    </linearGradient>
  </defs>
  <g filter="url(#pinShadow)">
    <!-- Jewel Pin Body with Bottom Anchor Tip -->
    <path d="M17 1C8.72 1 2 7.72 2 16c0 10.5 13.2 24.3 14.2 25.3a1.1 1.1 0 001.6 0C18.8 40.3 32 26.5 32 16c0-8.28-6.72-15-15-15z" fill="url(#pinGrad)"/>
    <circle cx="17" cy="16" r="11" fill="#FFFFFF"/>
    <circle cx="17" cy="16" r="9.5" fill="#FEF3C7"/>
    <!-- Sacred Temple Gopuram / Mandir Silhouette -->
    <path d="M17 9.5l3.2 4h-6.4l3.2-4z" fill="#991B1B"/>
    <rect x="14.2" y="14" width="5.6" height="3" rx="0.3" fill="#B91C1C"/>
    <rect x="13" y="17.5" width="8" height="3" rx="0.3" fill="#991B1B"/>
    <rect x="15.5" y="21" width="3" height="3.5" rx="0.4" fill="#78350F"/>
    <circle cx="17" cy="10" r="0.8" fill="#F59E0B"/>
    <line x1="12" y1="24.5" x2="22" y2="24.5" stroke="#B45309" stroke-width="1.2" stroke-linecap="round"/>
  </g>
</svg>
`)}`;

export const TEMPLE_SELECTED_MARKER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="42" height="54" fill="none">
  <defs>
    <filter id="selGlowShadow" x="-25%" y="-15%" width="150%" height="135%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#78350F" flood-opacity="0.45"/>
    </filter>
    <radialGradient id="auraGlow" cx="50%" cy="40%" r="50%">
      <stop offset="30%" stop-color="#F59E0B" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="selPinGrad" x1="0" y1="0" x2="42" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="40%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#991B1B"/>
    </linearGradient>
  </defs>
  <!-- Radiant Aura -->
  <circle cx="21" cy="20" r="20" fill="url(#auraGlow)"/>
  <g filter="url(#selGlowShadow)">
    <path d="M21 2C11.61 2 4 9.61 4 19c0 12 15 27.5 16.1 28.6a1.3 1.3 0 001.8 0C23 46.5 38 31 38 19c0-9.39-7.61-17-17-17z" fill="url(#selPinGrad)"/>
    <circle cx="21" cy="19" r="13" fill="#FFFFFF"/>
    <circle cx="21" cy="19" r="11" fill="#FEF3C7"/>
    <!-- Sacred Gopuram -->
    <path d="M21 11l4 5h-8l4-5z" fill="#78350F"/>
    <rect x="17.5" y="16.5" width="7" height="3.5" rx="0.4" fill="#991B1B"/>
    <rect x="16" y="20.5" width="10" height="3.5" rx="0.4" fill="#7F1D1D"/>
    <rect x="19.2" y="24.5" width="3.6" height="4" rx="0.4" fill="#451A03"/>
    <circle cx="21" cy="11.5" r="1" fill="#F59E0B"/>
    <line x1="14.5" y1="28.5" x2="27.5" y2="28.5" stroke="#92400E" stroke-width="1.4" stroke-linecap="round"/>
  </g>
</svg>
`)}`;

export const ORIGIN_MARKER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42" fill="none">
  <path d="M16 2C8.268 2 2 8.268 2 16c0 11.2 12.8 22.4 13.4 22.9a1 1 0 001.2 0C17.2 38.4 30 27.2 30 16 30 8.268 23.732 2 16 2z" fill="#047857"/>
  <path d="M16 3.5C8.82 3.5 3.5 8.82 3.5 16c0 10 11.5 20.3 12.5 21.3 1-1 12.5-11.3 12.5-21.3 0-7.18-5.32-12.5-12.5-12.5z" fill="#059669"/>
  <circle cx="16" cy="15" r="8" fill="#ECFDF5"/>
  <circle cx="16" cy="15" r="4" fill="#047857"/>
</svg>
`)}`;

export const DESTINATION_MARKER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 44" width="34" height="44" fill="none">
  <path d="M17 2C8.716 2 2 8.716 2 17c0 11.9 13.6 23.8 14.3 24.3a1.1 1.1 0 001.4 0C18.4 40.8 32 28.9 32 17 32 8.716 25.284 2 17 2z" fill="#991B1B"/>
  <path d="M17 3.5C9.268 3.5 3.5 9.268 3.5 17c0 10.6 12.2 21.5 13.5 22.6 1.3-1.1 13.5-12 13.5-22.6 0-7.732-5.768-13.5-13.5-13.5z" fill="#DC2626"/>
  <circle cx="17" cy="16" r="8.5" fill="#FEF2F2"/>
  <circle cx="17" cy="16" r="4.5" fill="#991B1B"/>
</svg>
`)}`;

export const DRAGGABLE_LOCATION_MARKER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46" width="36" height="46" fill="none">
  <path d="M18 2C9.163 2 2 9.163 2 18c0 12.8 14.5 25.5 15.2 26.1a1.2 1.2 0 001.6 0C19.5 43.5 34 30.8 34 18 34 9.163 26.837 2 18 2z" fill="#9A3412"/>
  <path d="M18 3.5C9.992 3.5 3.5 9.992 3.5 18c0 11.5 13.2 23.3 14.5 24.5 1.3-1.2 14.5-13 14.5-24.5 0-8.008-6.492-14.5-14.5-14.5z" fill="#EA580C"/>
  <circle cx="18" cy="17" r="9" fill="#FFF7ED"/>
  <circle cx="18" cy="17" r="4.5" fill="#C2410C"/>
</svg>
`)}`;

