import React from 'react';
import { NormalizedRoute, GeminiRouteSingleAnalysis } from '../../types';
import { 
  formatDistance, 
  getTrafficBadgeColor, 
  getRiskBadgeColor,
  getRouteColor 
} from '../../utils/formatters';
import { CheckCircle2, Clock, Navigation, AlertTriangle, Sparkles } from 'lucide-react';

interface RouteCardProps {
  route: NormalizedRoute;
  singleAnalysis?: GeminiRouteSingleAnalysis;
  isSelected: boolean;
  onSelect: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  singleAnalysis,
  isSelected,
  onSelect,
}) => {
  const trafficColors = getTrafficBadgeColor(route.trafficLevel);
  const riskColors = getRiskBadgeColor(route.riskLevel);
  const etaMins = Math.round(route.durationSeconds / 60);
  const delayMins = Math.round(route.predictedDelaySeconds / 60);
  const color = getRouteColor(route.routeIndex, route.isRecommended);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left relative overflow-hidden bg-white ${
        route.isRecommended
          ? 'border-2 border-[#007F86] shadow-sm'
          : isSelected
          ? 'border-2 border-[#102E3C] shadow-sm'
          : 'border border-[#DCE5E9] hover:border-[#617580] shadow-2xs'
      }`}
    >
      {/* Side Corridor Color Strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: color }}
      />

      <div className="pl-2 space-y-3">
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#112B37]">{route.name}</h4>
              {route.isRecommended && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E8F5ED] text-[#24735B] border border-[#24735B]/20 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  AI Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-[#617580] line-clamp-1 mt-0.5">{route.summary}</p>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-[#112B37]">
              {etaMins} <span className="text-xs text-[#617580] font-semibold">min</span>
            </span>
          </div>
        </div>

        {/* Confirmed Google Maps Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-[#F2F5F6] px-2.5 py-1.5 rounded-lg border border-[#DCE5E9]">
            <span className="text-[#617580] text-[10px] uppercase font-semibold block">OSRM Distance</span>
            <span className="text-[#112B37] font-bold">{formatDistance(route.distanceMeters)}</span>
          </div>

          <div className="bg-[#E1F2F1] px-2.5 py-1.5 rounded-lg border border-[#007F86]/20">
            <span className="text-[#007F86] text-[10px] uppercase font-semibold block">AI Delay Est.</span>
            <span className="text-[#007F86] font-bold">+{delayMins} min</span>
          </div>

          <div className="bg-[#F2F5F6] px-2.5 py-1.5 rounded-lg border border-[#DCE5E9]">
            <span className="text-[#617580] text-[10px] uppercase font-semibold block">Reliability</span>
            <span className="text-[#112B37] font-bold">{route.reliabilityScore}%</span>
          </div>
        </div>

        {/* Badges & Warning Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DCE5E9] text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${trafficColors.bg} ${trafficColors.text}`}>
              {route.trafficLevel.toUpperCase()} TRAFFIC
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${riskColors.bg} ${riskColors.text}`}>
              {route.riskLevel.toUpperCase()} RISK
            </span>
          </div>

          <span className="text-xs text-[#617580]">
            Suitability: <strong className="text-[#112B37] font-bold">{route.overallScore}/100</strong>
          </span>
        </div>

        {/* Reasoning snippet if available */}
        {singleAnalysis?.reasoning && (
          <p className="text-xs text-[#617580] bg-[#F2F5F6] p-2 rounded border border-[#DCE5E9] leading-relaxed">
            <span className="font-semibold text-[#112B37]">AI Analysis: </span>
            {singleAnalysis.reasoning}
          </p>
        )}
      </div>
    </div>
  );
};
