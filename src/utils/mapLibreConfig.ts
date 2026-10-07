import type { StyleSpecification } from 'maplibre-gl';
import * as maplibregl from 'maplibre-gl';
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

// Configure MapLibre Web Worker URL for Vite environment (dev & prod)
if (typeof window !== 'undefined' && typeof (maplibregl as any).setWorkerUrl === 'function') {
  (maplibregl as any).setWorkerUrl(maplibreglWorkerUrl);
}

/**
 * Retrieves the MapTiler API key from the Vite frontend environment.
 * In accordance with Vite standards, this must be prefixed with VITE_.
 */
export const getMapTilerApiKey = (): string => {
  return import.meta.env.VITE_MAPTILER_API_KEY || '';
};

export type MapStyleTier = 'satellite' | 'hybrid' | 'streets-light';

/**
 * Official MapTiler Style JSON Endpoints:
 * - Satellite: https://api.maptiler.com/maps/satellite/style.json?key=YOUR_KEY
 * - Hybrid: https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_KEY
 * - Streets Light: https://api.maptiler.com/maps/streets-v2-light/style.json?key=YOUR_KEY
 */

/**
 * Constructs the MapLibre GL style using MapTiler's official satellite style JSON.
 */
export const getMapTilerSatelliteStyle = (apiKey: string = getMapTilerApiKey()): string => {
  const key = apiKey.trim() || '2LvE33B4yCcEFu1XPixO';
  return `https://api.maptiler.com/maps/satellite/style.json?key=${encodeURIComponent(key)}`;
};

/**
 * Constructs the MapLibre GL style for MapTiler Hybrid (First Fallback).
 * Satellite imagery combined with roads, borders, labels, and landmarks.
 */
export const getMapTilerHybridStyle = (apiKey: string = getMapTilerApiKey()): string => {
  const key = apiKey.trim() || '2LvE33B4yCcEFu1XPixO';
  return `https://api.maptiler.com/maps/hybrid/style.json?key=${encodeURIComponent(key)}`;
};

/**
 * Constructs the MapLibre GL style for MapTiler Streets.Light (Second Fallback).
 * Light vector map harmonized with DevaSetu's ivory/cream/gold visual language.
 */
export const getMapTilerStreetsLightStyle = (apiKey: string = getMapTilerApiKey()): string => {
  const key = apiKey.trim() || '2LvE33B4yCcEFu1XPixO';
  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`;
};

/**
 * Alias for streets light style (backwards-compatible with previous toggle)
 */
export const getMapTilerStreetsStyle = getMapTilerStreetsLightStyle;

/**
 * Resolves the style specification or URL for any tier in the DevaSetu fallback hierarchy:
 * 1. 🛰️ MapTiler SATELLITE
 * 2. 🌍 MapTiler HYBRID
 * 3. 🗺️ MapTiler STREETS.LIGHT
 */
export const getMapStyleByTier = (
  tier: MapStyleTier,
  apiKey: string = getMapTilerApiKey()
): string => {
  switch (tier) {
    case 'satellite':
      return getMapTilerSatelliteStyle(apiKey);
    case 'hybrid':
      return getMapTilerHybridStyle(apiKey);
    case 'streets-light':
      return getMapTilerStreetsLightStyle(apiKey);
    default:
      return getMapTilerSatelliteStyle(apiKey);
  }
};

/**
 * High-contrast Sacred Temple Gopuram Marker HTML element for MapLibre GL JS
 * Engineered with a crisp 2.5px white outer stroke and deep shadow for maximum visibility
 * over dark green forests, mountain terrain, coastal water, and urban satellite imagery.
 */
export const createTempleMarkerElement = (isSelected = false): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'devasetu-temple-marker-container cursor-pointer select-none transition-transform duration-200 hover:scale-110';
  container.style.width = isSelected ? '44px' : '36px';
  container.style.height = isSelected ? '56px' : '46px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  const width = isSelected ? 44 : 36;
  const height = isSelected ? 56 : 46;

  container.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46" width="${width}" height="${height}" fill="none">
      <defs>
        <filter id="mPinShadow-${isSelected ? 'sel' : 'norm'}" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        <linearGradient id="mPinGrad-${isSelected ? 'sel' : 'norm'}" x1="0" y1="0" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FDE68A"/>
          <stop offset="35%" stop-color="#F59E0B"/>
          <stop offset="85%" stop-color="#D97706"/>
          <stop offset="100%" stop-color="#991B1B"/>
        </linearGradient>
      </defs>
      <g filter="url(#mPinShadow-${isSelected ? 'sel' : 'norm'})">
        <!-- High-contrast White Border Outer Pin -->
        <path d="M18 2C9.16 2 2 9.16 2 18c0 11.5 14.5 25.5 15.3 26.2a1 1 0 001.4 0C19.5 43.5 34 29.5 34 18c0-8.84-7.16-16-16-16z"
              fill="url(#mPinGrad-${isSelected ? 'sel' : 'norm'})"
              stroke="#FFFFFF"
              stroke-width="${isSelected ? '3' : '2.5'}"
              stroke-linejoin="round"/>
        <!-- Inner White Disc -->
        <circle cx="18" cy="18" r="11" fill="#FFFFFF"/>
        <circle cx="18" cy="18" r="9.5" fill="#FEF3C7"/>
        <!-- Sacred Temple Gopuram Silhouette -->
        <path d="M18 10.5l3.5 4.5h-7l3.5-4.5z" fill="#991B1B"/>
        <rect x="15" y="15.5" width="6" height="3" rx="0.4" fill="#B91C1C"/>
        <rect x="13.5" y="19" width="9" height="3" rx="0.4" fill="#991B1B"/>
        <rect x="16.2" y="22.5" width="3.6" height="3.5" rx="0.4" fill="#78350F"/>
        <circle cx="18" cy="11" r="0.9" fill="#F59E0B"/>
        <line x1="12" y1="26.5" x2="24" y2="26.5" stroke="#B45309" stroke-width="1.2" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  return container;
};

/**
 * Origin Pin (Green) with optional high-contrast city name badge for Plan Your Visit route map
 */
export const createOriginMarkerElement = (label?: string): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'devasetu-origin-marker select-none pointer-events-auto cursor-pointer';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';

  const labelHtml = label
    ? `<div style="background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(4px); border: 1.5px solid #059669; border-radius: 9999px; padding: 2.5px 9px; font-size: 11px; font-weight: 700; color: #065F46; box-shadow: 0 4px 10px rgba(0,0,0,0.22); white-space: nowrap; margin-bottom: 3px; display: inline-flex; align-items: center; gap: 4px; pointer-events: none;">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#059669;"></span>
        <span>${label}</span>
      </div>`
    : '';

  container.innerHTML = `
    ${labelHtml}
    <div style="width: 32px; height: 42px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42" fill="none">
        <defs>
          <filter id="originShadow" x="-20%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.55"/>
          </filter>
        </defs>
        <g filter="url(#originShadow)">
          <path d="M16 2C8.27 2 2 8.27 2 16c0 11.2 12.8 22.4 13.4 22.9a1 1 0 001.2 0C17.2 38.4 30 27.2 30 16 30 8.27 23.73 2 16 2z"
                fill="#059669" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="16" cy="15" r="7.5" fill="#ECFDF5"/>
          <circle cx="16" cy="15" r="4" fill="#047857"/>
        </g>
      </svg>
    </div>
  `;
  return container;
};

/**
 * Destination Pin (Crimson Red) with optional high-contrast temple/city badge for Plan Your Visit route map
 */
export const createDestinationMarkerElement = (label?: string): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'devasetu-dest-marker select-none pointer-events-auto cursor-pointer';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';

  const labelHtml = label
    ? `<div style="background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(4px); border: 1.5px solid #DC2626; border-radius: 9999px; padding: 2.5px 9px; font-size: 11px; font-weight: 700; color: #991B1B; box-shadow: 0 4px 10px rgba(0,0,0,0.22); white-space: nowrap; margin-bottom: 3px; display: inline-flex; align-items: center; gap: 4px; pointer-events: none;">
        <span>🕉️</span>
        <span>${label}</span>
      </div>`
    : '';

  container.innerHTML = `
    ${labelHtml}
    <div style="width: 34px; height: 44px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 44" width="34" height="44" fill="none">
        <defs>
          <filter id="destShadow" x="-20%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.55"/>
          </filter>
        </defs>
        <g filter="url(#destShadow)">
          <path d="M17 2C8.72 2 2 8.72 2 17c0 11.9 13.6 23.8 14.3 24.3a1.1 1.1 0 001.4 0C18.4 40.8 32 28.9 32 17 32 8.72 25.28 2 17 2z"
                fill="#DC2626" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="17" cy="16" r="8" fill="#FEF2F2"/>
          <circle cx="17" cy="16" r="4.5" fill="#991B1B"/>
        </g>
      </svg>
    </div>
  `;
  return container;
};
