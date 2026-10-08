import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Navigation, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LocationPoint, NormalizedRoute } from '../../types';

interface GetDirectionsCardProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  selectedRoute?: NormalizedRoute | null;
  className?: string;
}

export const GetDirectionsCard: React.FC<GetDirectionsCardProps> = ({
  origin,
  destination,
  selectedRoute,
  className = '',
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetDirections = () => {
    setErrorMessage(null);

    // Validate origin
    const hasOrigin = origin && (origin.address?.trim() || (origin.lat && origin.lng));
    if (!hasOrigin) {
      setErrorMessage('Please select a starting location first.');
      return;
    }

    // Validate destination
    const hasDestination = destination && (destination.address?.trim() || (destination.lat && destination.lng));
    if (!hasDestination) {
      setErrorMessage('Please select an emergency destination first.');
      return;
    }

    // Prefer coordinates for maximum navigation accuracy if present, fallback to formatted address
    const originParam =
      origin.lat && origin.lng && origin.lat !== 0 && origin.lng !== 0
        ? `${origin.lat},${origin.lng}`
        : origin.address;

    const destParam =
      destination.lat && destination.lng && destination.lat !== 0 && destination.lng !== 0
        ? `${destination.lat},${destination.lng}`
        : destination.address;

    const originEncoded = encodeURIComponent(originParam);
    const destEncoded = encodeURIComponent(destParam);

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originEncoded}&destination=${destEncoded}&travelmode=driving`;

    // Open Google Maps in a new tab without navigating away from RapidPath
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={`p-4 sm:p-5 bg-white border border-[#007F86]/30 shadow-sm rounded-xl space-y-3 ${className}`}>
      {/* Validation Message Banner if needed */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-[#FFF2F2] border border-[#C73540]/30 rounded-lg text-xs text-[#C73540] animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Navigation Icon & Get Directions Action Button */}
        <div className="flex items-center gap-3">
          {/* Small teal rounded-square icon container */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#E1F2F1] text-[#007F86] flex items-center justify-center shrink-0 border border-[#007F86]/20 shadow-xs">
            <Navigation className="w-5 h-5 text-[#007F86] fill-[#007F86]/20" />
          </div>

          {/* Large teal button */}
          <Button
            type="button"
            size="md"
            variant="primary"
            onClick={handleGetDirections}
            className="text-sm sm:text-base font-bold px-4 sm:px-6 py-2.5 bg-[#007F86] hover:bg-[#006B70] shadow-sm rounded-lg flex-1 sm:flex-initial"
          >
            Get Directions
          </Button>

          {/* External-link text (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#112B37] pl-1">
            <ExternalLink className="w-4 h-4 text-[#007F86]" />
            <span>Open this route in Google Maps</span>
          </div>
        </div>

        {/* Selected corridor indicator if route is active */}
        {selectedRoute && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full bg-[#E8F5ED] text-[#24735B] text-xs font-bold border border-[#24735B]/20 max-w-full">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">{selectedRoute.name} Active</span>
          </div>
        )}
      </div>

      {/* Mobile-only secondary label */}
      <div className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-[#112B37] pt-1">
        <ExternalLink className="w-3.5 h-3.5 text-[#007F86] shrink-0" />
        <span className="truncate">Open this route in Google Maps</span>
      </div>

      {/* Helper text below controls */}
      <p className="text-[11px] sm:text-xs text-[#617580] pt-1 border-t border-[#DCE5E9]/60">
        Click to open the selected route in Google Maps for turn-by-turn directions.
      </p>
    </Card>
  );
};
