import React from 'react';
import { Card } from '../ui/Card';
import { Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { NormalizedRoute } from '../../types';

interface RouteComparisonPanelProps {
  routes?: NormalizedRoute[];
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
}

export const RouteComparisonPanel: React.FC<RouteComparisonPanelProps> = ({
  routes = [],
  selectedRouteIndex,
  onSelectRoute,
}) => {
  const letters = ['A', 'B', 'C', 'D'];

  if (!routes || routes.length === 0) {
    return null;
  }

  const displayData = routes.slice(0, 3).map((r, idx) => {
    const letter = letters[idx] || `${idx + 1}`;
    const etaMins = Math.round(r.durationSeconds / 60);
    const distKm = (r.distanceMeters / 1000).toFixed(1);
    const delayMins = Math.max(1, Math.round(r.predictedDelaySeconds / 60));

    return {
      id: r.id || `route-${idx}`,
      index: idx,
      name: `Route ${letter}`,
      badge: r.isRecommended ? 'AI Recommended' : idx === 0 ? 'Fastest Direct' : 'Alternative Corridor',
      badgeClass: r.isRecommended
        ? 'bg-[#E8F5ED] text-[#24735B] border-[#24735B]/30'
        : idx === 0
        ? 'bg-[#FFF2D7] text-[#97610A] border-[#97610A]/20'
        : 'bg-[#F2F5F6] text-[#617580] border-[#DCE5E9]',
      eta: `${etaMins} min`,
      distance: `${distKm} km`,
      traffic: r.trafficLevel.toUpperCase(),
      trafficClass:
        r.trafficLevel === 'low'
          ? 'text-[#24735B] bg-[#E8F5ED]'
          : r.trafficLevel === 'moderate'
          ? 'text-[#97610A] bg-[#FFF2D7]'
          : 'text-[#C73540] bg-[#FCECEE]',
      delay: `+${delayMins} min`,
      delayClass: r.trafficLevel === 'low' ? 'text-[#24735B]' : 'text-[#C73540]',
      risk: r.riskLevel.toUpperCase(),
      riskClass:
        r.riskLevel === 'low'
          ? 'text-[#24735B] bg-[#E8F5ED]'
          : r.riskLevel === 'medium'
          ? 'text-[#97610A] bg-[#FFF2D7]'
          : 'text-[#C73540] bg-[#FCECEE]',
      score: `${r.overallScore || 90}/100`,
      summary: r.summary,
      isRecommended: r.isRecommended,
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#112B37] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#007F86]" />
          <span>Compare Corridors (Route A, Route B, Route C)</span>
        </h3>
        <span className="text-xs text-[#617580]">Click any corridor to inspect on map</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayData.map((r) => {
          const isSelected = selectedRouteIndex === r.index;
          return (
            <div
              key={r.id}
              onClick={() => onSelectRoute(r.index)}
              className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-2 border-[#007F86] shadow-md ring-1 ring-[#007F86]'
                  : r.isRecommended
                  ? 'bg-white border-2 border-[#007F86]/60 shadow-xs'
                  : 'bg-white border border-[#DCE5E9] hover:border-[#617580] shadow-sm'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#112B37] text-sm">{r.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${r.badgeClass}`}
                  >
                    {r.badge}
                  </span>
                </div>

                {/* Primary Metric */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#112B37]">{r.eta}</span>
                  </div>
                  <span className="text-xs text-[#617580]">{r.distance}</span>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DCE5E9] text-xs">
                  <div>
                    <span className="text-[11px] text-[#617580] block">Traffic</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold mt-0.5 ${r.trafficClass}`}>
                      {r.traffic}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#617580] block">Predicted Delay</span>
                    <span className={`font-semibold block mt-0.5 ${r.delayClass}`}>
                      {r.delay}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#617580] block">Risk</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold mt-0.5 ${r.riskClass}`}>
                      {r.risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#617580] block">Score</span>
                    <span className="font-bold text-[#112B37] block mt-0.5">
                      {r.score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
