import React from 'react';
import { Card } from '../ui/Card';
import { Activity } from 'lucide-react';

export const TrafficStatusCard: React.FC = () => {
  return (
    <Card className="p-5 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E9]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#617580] flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#007F86]" />
          <span>Traffic Conditions</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E8F5ED] text-[#24735B]">
          Good
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#617580]">Current traffic:</span>
          <span className="font-semibold text-[#24735B]">Low</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#617580]">Potential congestion:</span>
          <span className="font-semibold text-[#97610A]">Moderate</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#617580]">Overall traffic status:</span>
          <span className="font-semibold text-[#24735B]">Good</span>
        </div>

        {/* Subtle Horizontal Visualization (Section 20) */}
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#617580]">
            <span className="w-16">Low</span>
            <div className="flex-1 h-2 bg-[#E8F5ED] rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-[#24735B] rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#617580]">
            <span className="w-16">Moderate</span>
            <div className="flex-1 h-2 bg-[#FFF2D7] rounded-full overflow-hidden">
              <div className="w-[45%] h-full bg-[#97610A] rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#617580]">
            <span className="w-16">Heavy</span>
            <div className="flex-1 h-2 bg-[#FCECEE] rounded-full overflow-hidden">
              <div className="w-[12%] h-full bg-[#C73540] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
