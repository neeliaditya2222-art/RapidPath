import React from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, Activity } from 'lucide-react';

export const RouteScoreCard: React.FC<{ score?: number }> = ({ score = 94 }) => {
  return (
    <Card className="p-5 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E9]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#617580] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#007F86]" />
          <span>Emergency Suitability</span>
        </h3>
        <span className="text-xs font-semibold text-[#24735B]">High Optimal</span>
      </div>

      {/* Main Circular / Prominent Score Component (Section 19) */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-[#007F86] bg-[#E1F2F1]/40 shrink-0">
          <div className="text-center">
            <span className="text-2xl font-black text-[#112B37] leading-none block">{score}</span>
            <span className="text-[10px] text-[#617580] font-semibold">/ 100</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <span className="text-[11px] text-[#617580] block">Traffic Score</span>
            <span className="font-bold text-[#112B37]">92</span>
          </div>
          <div>
            <span className="text-[11px] text-[#617580] block">Reliability</span>
            <span className="font-bold text-[#112B37]">96</span>
          </div>
          <div>
            <span className="text-[11px] text-[#617580] block">Delay Risk</span>
            <span className="font-bold text-[#112B37]">91</span>
          </div>
          <div>
            <span className="text-[11px] text-[#617580] block">Suitability</span>
            <span className="font-bold text-[#112B37]">97</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
