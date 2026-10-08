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
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-[#C73540] text-white flex items-center justify-center shrink-0">
          <Siren className="w-4 h-4 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#C73540] tracking-wide uppercase text-[11px] sm:text-xs">
              {priority.toUpperCase()} EMERGENCY
            </span>
            <span className="text-[#617580] hidden xs:inline">•</span>
            <span className="font-semibold text-[#112B37] capitalize text-[11px] sm:text-xs">{vehicleType.replace('_', ' ')}</span>
          </div>
          <div className="text-[#112B37] font-medium mt-0.5 flex flex-wrap sm:flex-nowrap items-center gap-1 text-[11px] sm:text-xs">
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{originText || 'Secunderabad'}</span>
            <span className="text-[#617580] shrink-0">→</span>
            <span className="font-semibold text-[#007F86] truncate max-w-[180px] sm:max-w-[280px] lg:max-w-none">{destinationText || 'Apollo Hospital'}</span>
          </div>
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
