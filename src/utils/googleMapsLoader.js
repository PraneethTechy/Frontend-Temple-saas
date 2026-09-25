let googleMapsPromise = null;

/**
 * Dynamically loads the Google Maps JavaScript API script tag.
 * Returns a promise that resolves to `window.google.maps` when loaded,
 * or resolves to `null` if no API key is provided or loading fails.
 */
export const loadGoogleMaps = (apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY) => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  // If already loaded and available on window
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  // If no API key provided, safely return null without breaking
  if (!apiKey || !apiKey.trim()) {
    return Promise.resolve(null);
  }

  // Reuse existing load in flight
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve) => {
    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve(window.google?.maps || null);
      });
      existingScript.addEventListener('error', () => {
        resolve(null);
      });
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey.trim())}&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(window.google?.maps || null);
    };

    script.onerror = (err) => {
      console.warn('Google Maps script failed to load:', err);
      resolve(null);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export default loadGoogleMaps;
