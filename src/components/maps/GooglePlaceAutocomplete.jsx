import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';
import {
  useLazySearchPlacesQuery,
  useLazyGetPlaceDetailsQuery,
} from '../../store/api/visitPlanApi.js';

/**
 * GooglePlaceAutocomplete
 *
 * Modern location autocomplete powered by Google Places API (New).
 * Does not trigger legacy Google Maps JavaScript API errors.
 */
export const GooglePlaceAutocomplete = ({
  value = '',
  onSelect,
  placeholder = 'Search your starting location (e.g. Hyderabad, Telangana)...',
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [triggerSearch, { isFetching: isSearching }] = useLazySearchPlacesQuery();
  const [triggerGetDetails] = useLazyGetPlaceDetailsQuery();

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search on input change
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);

    if (!text.trim() || text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await triggerSearch(text.trim()).unwrap();
        const items = res?.data?.suggestions || [];
        setSuggestions(items);
        setIsOpen(items.length > 0);
      } catch (err) {
        console.warn('[GooglePlaceAutocomplete] Search failed:', err);
        setSuggestions([]);
      }
    }, 280);
  };

  // Select place from suggestions
  const handleSelectSuggestion = async (item) => {
    setInputValue(item.text || item.mainText);
    setIsOpen(false);
    setIsFetchingDetails(true);

    try {
      const res = await triggerGetDetails(item.placeId).unwrap();
      const place = res?.data?.place;

      if (place && onSelect) {
        onSelect({
          placeId: place.placeId,
          name: place.name || item.mainText,
          formattedAddress: place.formattedAddress || item.text,
          latitude: place.latitude,
          longitude: place.longitude,
        });
      }
    } catch (err) {
      console.warn('[GooglePlaceAutocomplete] Get details failed:', err);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect(null);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700 pointer-events-none">
          <MapPin className="w-4 h-4 text-amber-600" />
        </div>

        <input
          id="starting-location-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled || isFetchingDetails}
          autoComplete="off"
          aria-label="Starting location"
          className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 focus:bg-white transition-all shadow-xs disabled:opacity-60"
        />

        {/* Loading Spinner or Clear Button */}
        {isSearching || isFetchingDetails ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-700">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          </div>
        ) : inputValue && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location input"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Modern Places Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-stone-100 max-h-72 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.placeId}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-amber-50/70 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-800 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-amber-900 truncate">
                  {item.mainText}
                </div>
                {item.secondaryText && (
                  <div className="text-[11px] text-stone-400 group-hover:text-stone-600 truncate mt-0.5">
                    {item.secondaryText}
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Google Places attribution footer */}
          <div className="px-4 py-2 bg-stone-50 text-[10px] text-stone-400 flex items-center justify-between">
            <span>Google Places (New)</span>
            <span className="font-semibold text-stone-500">DevaSetu Navigation</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlaceAutocomplete;
