import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Navigation, Info, CheckCircle2 } from 'lucide-react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader.js';

export const GoogleMapLocationPicker = ({
  latitude,
  longitude,
  mapUrl,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [mapsApi, setMapsApi] = useState(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState({
    lat: latitude ? Number(latitude) : 13.0827, // Default center (e.g. Chennai / South India)
    lng: longitude ? Number(longitude) : 80.2707,
  });
  const [hasValidCoords, setHasValidCoords] = useState(
    Boolean(latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude)))
  );
  const [selectionNotice, setSelectionNotice] = useState('');

  // Update internal coords if prop changes from outside
  useEffect(() => {
    if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      setSelectedCoords({ lat: Number(latitude), lng: Number(longitude) });
      setHasValidCoords(true);
    }
  }, [latitude, longitude]);

  // Load Google Maps API
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted) return;
        if (maps) {
          setMapsApi(maps);
          setIsApiAvailable(true);
        } else {
          setIsApiAvailable(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsApiAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map and Marker once maps API and container are ready
  useEffect(() => {
    if (!mapsApi || !mapContainerRef.current) return;

    const initialCenter = hasValidCoords
      ? selectedCoords
      : { lat: 12.2253, lng: 79.0677 }; // Tamil Nadu / Sacred region default

    const map = new mapsApi.Map(mapContainerRef.current, {
      center: initialCenter,
      zoom: hasValidCoords ? 15 : 7,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    const marker = new mapsApi.Marker({
      position: initialCenter,
      map: hasValidCoords ? map : null,
      draggable: true,
      title: 'Temple Location',
      animation: mapsApi.Animation.DROP,
    });
    markerInstanceRef.current = marker;

    // Helper to update location from coordinate position
    const updateFromPosition = (latLng, label = 'Pin location selected') => {
      const lat = Number(latLng.lat().toFixed(6));
      const lng = Number(latLng.lng().toFixed(6));
      setSelectedCoords({ lat, lng });
      setHasValidCoords(true);

      marker.setPosition(latLng);
      marker.setMap(map);

      const generatedMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      onLocationSelect?.({
        latitude: lat,
        longitude: lng,
        mapUrl: generatedMapUrl,
      });

      setSelectionNotice(`${label}: ${lat}, ${lng}`);
    };

    // Marker drag end listener
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) {
        updateFromPosition(pos, 'Pin adjusted');
      }
    });

    // Map click listener to set/move pin
    map.addListener('click', (e) => {
      if (e.latLng) {
        updateFromPosition(e.latLng, 'Map location chosen');
      }
    });

    // Initialize Autocomplete on Search input
    if (searchInputRef.current && mapsApi.places) {
      const autocomplete = new mapsApi.places.Autocomplete(searchInputRef.current, {
        fields: ['geometry', 'formatted_address', 'name', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const loc = place.geometry.location;
        const lat = Number(loc.lat().toFixed(6));
        const lng = Number(loc.lng().toFixed(6));

        setSelectedCoords({ lat, lng });
        setHasValidCoords(true);

        map.setCenter(loc);
        map.setZoom(16);

        marker.setPosition(loc);
        marker.setMap(map);

        // Parse address components
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let pincode = '';

        if (Array.isArray(place.address_components)) {
          place.address_components.forEach((comp) => {
            const types = comp.types || [];
            if (types.includes('street_number')) streetNumber = comp.long_name;
            if (types.includes('route')) route = comp.long_name;
            if (types.includes('locality')) city = comp.long_name;
            if (!city && types.includes('administrative_area_level_2')) city = comp.long_name;
            if (types.includes('administrative_area_level_1')) state = comp.long_name;
            if (types.includes('postal_code')) pincode = comp.long_name;
          });
        }

        const address = [streetNumber, route].filter(Boolean).join(' ') || place.name || place.formatted_address;
        const generatedMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        onLocationSelect?.({
          latitude: lat,
          longitude: lng,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          mapUrl: generatedMapUrl,
        });

        setSelectionNotice(`Selected: ${place.name || place.formatted_address}`);
      });
    }
  }, [mapsApi]);

  if (!isApiAvailable) {
    return (
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Interactive Google Map Location Picker</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Google Maps API key is currently not active (<code className="text-amber-950 font-mono">VITE_GOOGLE_MAPS_API_KEY</code>). You can still specify coordinates and location details manually using the fields below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-stone-50 border border-amber-200/70 rounded-2xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-bold text-spiritual-text">
            Search Temple on Google Maps
          </span>
        </div>
        <span className="text-[10px] text-stone-500">
          Click map or drag marker to set coordinates
        </span>
      </div>

      {/* Places Autocomplete Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search temple name, town, or landmark (e.g. Arunachaleswarar Temple, Tiruvannamalai)..."
          className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-spiritual-border text-xs text-stone-800 focus:outline-hidden focus:border-spiritual-primary shadow-2xs"
        />
      </div>

      {/* Interactive Map Preview */}
      <div className="h-56 sm:h-64 w-full rounded-xl overflow-hidden border border-amber-200/80 relative bg-stone-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Selection Confirmation Notice */}
      {selectionNotice && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{selectionNotice}</span>
        </div>
      )}
    </div>
  );
};

export default GoogleMapLocationPicker;
