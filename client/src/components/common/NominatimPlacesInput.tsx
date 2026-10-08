import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Loader2, Navigation } from 'lucide-react';

interface NominatimResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

interface NominatimPlacesInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: { address: string; lat: number; lng: number; placeId?: string }) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  error?: string;
  className?: string;
  hasCoordinates?: boolean;
}

export const NominatimPlacesInput: React.FC<NominatimPlacesInputProps> = ({
  id,
  label,
  value,
  onChange,
  onPlaceSelected,
  placeholder = 'Search address or place...',
  leftIcon,
  error,
  className = '',
  hasCoordinates = false,
}) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setIsOpen(data.length > 0);
        }
      } catch (err) {
        console.warn('Nominatim suggestion fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.display_name;

    onChange(address);
    onPlaceSelected({
      address,
      lat,
      lng,
      placeId: String(item.place_id),
    });
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={dropdownRef} className={`space-y-1 relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
            {label}
          </label>
          <div className="flex items-center gap-1.5">
            {hasCoordinates && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#24735B] bg-[#E8F5ED] px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                OSM GPS Locked
              </span>
            )}
            <span className="text-[10px] text-[#007F86] bg-[#E1F2F1] px-1.5 py-0.5 rounded font-semibold">
              Nominatim Search
            </span>
          </div>
        </div>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#617580]">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white py-2.5 text-sm text-[#112B37] placeholder-[#8B9FA8] transition-colors focus:border-[#007F86] focus:outline-none focus:ring-1 focus:ring-[#007F86] ${
            leftIcon ? 'pl-9 pr-8' : 'px-3.5 pr-8'
          } ${error ? 'border-[#C73540] focus:border-[#C73540] focus:ring-[#C73540]' : 'border-[#DCE5E9]'}`}
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 flex items-center pointer-events-none text-[#8B9FA8]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[2000] mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#DCE5E9] bg-white p-1 shadow-lg">
          {suggestions.map((item) => (
            <div
              key={item.place_id}
              onClick={() => handleSelectSuggestion(item)}
              className="flex items-start gap-2.5 rounded-md p-2 text-xs text-[#112B37] hover:bg-[#E1F2F1] cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#007F86] mt-0.5 flex-shrink-0" />
              <div className="flex-1 line-clamp-2">
                <span className="font-medium text-[#112B37]">{item.display_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-[#C73540] flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
