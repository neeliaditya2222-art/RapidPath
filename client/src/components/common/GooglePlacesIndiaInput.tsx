import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, AlertCircle, MapPin, Building2, Clock, CheckCircle2, Hospital } from 'lucide-react';
import { locationApi } from '../../api/locationApi';
import { NearbyHospital } from '../../types';

interface GooglePlacesIndiaInputProps {
  id?: string;
  value?: string;
  placeholder?: string;
  nearbyHospitals?: NearbyHospital[];
  currentCoords?: { lat: number; lng: number } | null;
  onPlaceSelect: (place: {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
  }) => void;
  className?: string;
  error?: string;
}

interface Suggestion {
  description: string;
  mainText: string;
  secondaryText: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  isHospital?: boolean;
  distanceMeters?: number;
  durationMinutes?: number;
}

export const GooglePlacesIndiaInput: React.FC<GooglePlacesIndiaInputProps> = ({
  id = 'destination-search-input',
  value: controlledValue = '',
  placeholder = 'Search hospital, address, or location in India',
  nearbyHospitals = [],
  currentCoords = null,
  onPlaceSelect,
  className = '',
  error: propError,
}) => {
  const [inputValue, setInputValue] = useState(controlledValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(controlledValue);
  }, [controlledValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format hospital suggestions from nearbyHospitals
  const getHospitalSuggestions = useCallback(
    (filterQuery = ''): Suggestion[] => {
      if (!nearbyHospitals || nearbyHospitals.length === 0) return [];

      let list = nearbyHospitals;
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        list = nearbyHospitals.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.address.toLowerCase().includes(q) ||
            q.includes('hosp') ||
            q.includes('emerg')
        );
      }

      return list.map((h) => ({
        description: `${h.name}, ${h.address}`,
        mainText: h.name,
        secondaryText: `${(h.distanceMeters / 1000).toFixed(1)} km • ~${h.estimatedDurationMinutes} min • ${h.address}`,
        placeId: h.placeId,
        lat: h.latitude,
        lng: h.longitude,
        isHospital: true,
        distanceMeters: h.distanceMeters,
        durationMinutes: h.estimatedDurationMinutes,
      }));
    },
    [nearbyHospitals]
  );

  // Fetch search suggestions (strictly for India)
  const fetchSuggestions = useCallback(
    async (query: string) => {
      const q = (query || '').trim();

      // If empty or focused without typing, show the nearest hospitals accurately
      if (!q || q.length < 2) {
        const hospitalList = getHospitalSuggestions('');
        if (hospitalList.length > 0) {
          setSuggestions(hospitalList);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
        return;
      }

      setIsLoadingSuggestions(true);

      try {
        const matchedHospitals = getHospitalSuggestions(q);
        const geoResults: Suggestion[] = [];

        // Query Nominatim with India restriction
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=in&addressdetails=1&limit=6`;

        const response = await fetch(nominatimUrl, {
          headers: { 'User-Agent': 'RapidPath-Emergency-App/2.0' },
        });
        const data = await response.json();

        if (data && Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            const parts = item.display_name.split(',');
            const main = parts[0];
            const secondary = parts.slice(1, 4).join(',').trim();
            const isHosp =
              item.type === 'hospital' ||
              item.class === 'amenity' ||
              main.toLowerCase().includes('hospital') ||
              main.toLowerCase().includes('clinic');

            geoResults.push({
              description: item.display_name,
              mainText: main,
              secondaryText: secondary,
              placeId: String(item.place_id),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              isHospital: isHosp,
            });
          });
        }

        // Combine: Matching nearby hospitals first, then general geocoded locations
        const combined = [...matchedHospitals, ...geoResults];

        // Deduplicate by name/description
        const seen = new Set<string>();
        const unique = combined.filter((item) => {
          const key = item.mainText.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setSuggestions(unique);
        setShowDropdown(unique.length > 0);
      } catch (err) {
        console.warn('Autocomplete fetch notice:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [getHospitalSuggestions]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setValidationError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 250);
  };

  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    setInputValue(suggestion.description);
    setShowDropdown(false);
    setValidationError(null);

    // If coordinates already provided (e.g. from nearby hospital or geocode)
    if (suggestion.lat && suggestion.lng) {
      onPlaceSelect({
        address: suggestion.description,
        lat: suggestion.lat,
        lng: suggestion.lng,
        placeId: suggestion.placeId,
      });
      return;
    }

    // Geocode description if lat/lng are missing
    try {
      const res = await locationApi.geocodeAddress(suggestion.description);
      if (res?.data) {
        if (!res.data.isIndia) {
          setValidationError('Emergency destinations must be within India.');
          return;
        }
        onPlaceSelect({
          address: res.data.formattedAddress || suggestion.description,
          lat: res.data.lat,
          lng: res.data.lng,
          placeId: suggestion.placeId,
        });
      }
    } catch (err) {
      console.warn('Geocoding selected suggestion error:', err);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!inputValue.trim()) {
      const hospitalList = getHospitalSuggestions('');
      if (hospitalList.length > 0) {
        setSuggestions(hospitalList);
        setShowDropdown(true);
      }
    } else {
      fetchSuggestions(inputValue);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputValue.trim()) return;

      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
        return;
      }

      setValidationError(null);
      try {
        const res = await locationApi.geocodeAddress(inputValue);
        if (res?.data) {
          if (!res.data.isIndia) {
            setValidationError('Emergency destinations must be within India.');
            return;
          }
          onPlaceSelect({
            address: res.data.formattedAddress || inputValue,
            lat: res.data.lat,
            lng: res.data.lng,
          });
        }
      } catch (err) {
        setValidationError('Location not found in India. Please refine query.');
      }
    }
  };

  const currentError = propError || validationError;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`relative flex items-center bg-white border rounded-lg transition-all duration-200 ${
          currentError
            ? 'border-[#C73540] ring-2 ring-[#C73540]/10'
            : isFocused
            ? 'border-[#007F86] ring-2 ring-[#007F86]/10 shadow-xs'
            : 'border-[#DCE5E9] hover:border-[#617580]/40'
        } ${className}`}
      >
        <div className="pl-3.5 pr-2 py-2.5 text-[#617580] flex items-center pointer-events-none">
          <Search className={`w-4 h-4 ${isFocused ? 'text-[#007F86]' : 'text-[#617580]'}`} />
        </div>

        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full py-2.5 pr-8 text-sm text-[#112B37] placeholder-[#617580]/60 bg-transparent focus:outline-none font-medium"
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              const hospitalList = getHospitalSuggestions('');
              setSuggestions(hospitalList);
              setShowDropdown(hospitalList.length > 0);
              setValidationError(null);
            }}
            className="pr-3 text-xs text-[#617580] hover:text-[#112B37]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown with Nearest Hospitals Highlighting */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DCE5E9] rounded-lg shadow-lg z-[2000] max-h-64 overflow-y-auto divide-y divide-[#DCE5E9]">
          <div className="px-3 py-1.5 bg-[#F8FAFB] text-[10px] font-bold text-[#617580] uppercase tracking-wider flex items-center justify-between">
            <span>Nearest Emergency Facilities in India</span>
            <span>Accurate GPS Distance</span>
          </div>

          {suggestions.map((sug, idx) => (
            <button
              key={sug.placeId || idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectSuggestion(sug);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-[#F2F5F6] flex items-start justify-between gap-2.5 transition-colors group"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    sug.isHospital ? 'bg-[#E8F5ED] text-[#24735B]' : 'bg-[#E1F2F1] text-[#007F86]'
                  }`}
                >
                  {sug.isHospital ? (
                    <span className="text-xs">🏥</span>
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-[#007F86]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[#112B37] truncate group-hover:text-[#007F86]">
                      {sug.mainText}
                    </p>
                    {sug.isHospital && (
                      <span className="text-[9px] font-semibold bg-[#E8F5ED] text-[#24735B] px-1.5 py-0.2 rounded flex-shrink-0">
                        Hospital
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#617580] truncate mt-0.5">{sug.secondaryText}</p>
                </div>
              </div>

              {sug.distanceMeters && (
                <div className="text-right flex-shrink-0 pl-1">
                  <span className="text-xs font-bold text-[#007F86]">
                    {(sug.distanceMeters / 1000).toFixed(1)} km
                  </span>
                  {sug.durationMinutes && (
                    <p className="text-[10px] text-[#617580] flex items-center justify-end gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>~{sug.durationMinutes}m</span>
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Validation Error Message */}
      {currentError && (
        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-[#C73540] animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{currentError}</span>
        </div>
      )}
    </div>
  );
};
