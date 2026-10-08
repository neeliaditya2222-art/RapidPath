import React from 'react';
import { AlertCircle, Siren, Navigation } from 'lucide-react';
import { VehicleType, EmergencyPriority } from '../../types';

interface ActiveEmergencyBannerProps {
  vehicleType: VehicleType;
  priority: EmergencyPriority;
  originText: string;
  destinationText: string;
  statusText?: string;
}

export const ActiveEmergencyBanner: React.FC<ActiveEmergencyBannerProps> = ({
  vehicleType,
  priority,
  originText,
  destinationText,
  statusText = 'Route analysis active',
}) => {
  return (
    <div className="bg-[#FCECEE] border border-[#C73540]/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#C73540] text-white flex items-center justify-center shrink-0">
          <Siren className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#C73540] tracking-wide uppercase">
              {priority.toUpperCase()} EMERGENCY
            </span>
            <span className="text-[#617580]">•</span>
            <span className="font-semibold text-[#112B37] capitalize">{vehicleType.replace('_', ' ')}</span>
          </div>
          <p className="text-[#112B37] font-medium mt-0.5 flex items-center gap-1.5 truncate">
            <span>{originText || 'Secunderabad'}</span>
            <span className="text-[#617580]">→</span>
            <span className="font-semibold text-[#007F86]">{destinationText || 'Apollo Hospital'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <span className="px-2.5 py-1 rounded-full bg-white text-[#C73540] border border-[#C73540]/30 font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C73540] animate-ping" />
          {statusText}
        </span>
      </div>
    </div>
  );
};
