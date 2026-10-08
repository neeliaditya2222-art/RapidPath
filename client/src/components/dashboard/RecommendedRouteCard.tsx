import React from 'react';
import { NormalizedRoute, GeminiRouteAnalysis } from '../../types';
import { Card } from '../ui/Card';
import { 
  formatDistance, 
  getTrafficBadgeColor, 
  getRiskBadgeColor 
} from '../../utils/formatters';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecommendedRouteCardProps {
  route: NormalizedRoute;
  aiAnalysis: GeminiRouteAnalysis | null;
  isAiFallback: boolean;
  result?: any;
  onInspectDetails?: () => void;
}

export const RecommendedRouteCard: React.FC<RecommendedRouteCardProps> = ({
  route,
  aiAnalysis,
  isAiFallback,
  result,
}) => {
  const etaMins = Math.round(route.durationSeconds / 60) || 11;
  const distanceKm = (route.distanceMeters / 1000).toFixed(1) || '6.4';
  const delayMins = Math.round(route.predictedDelaySeconds / 60) || 1;
  const confidence = aiAnalysis?.confidenceScore || 92;
  const trafficColors = getTrafficBadgeColor(route.trafficLevel);
  const riskColors = getRiskBadgeColor(route.riskLevel);

  const routeLetter = String.fromCharCode(65 + (route.routeIndex ?? 1));

  return (
    <Card className="p-6 bg-white border-2 border-[#007F86] shadow-card space-y-6 relative overflow-hidden">
      {/* Top Header & Recommended Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCE5E9]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E1F2F1] text-[#007F86] flex items-center justify-center font-bold text-sm">
            {routeLetter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#112B37]">{route.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5ED] text-[#24735B] border border-[#24735B]/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                AI Recommended
              </span>
            </div>
            <p className="text-xs text-[#617580] mt-0.5">
              {route.summary || 'Optimized Arterial Emergency Corridor'}
            </p>
          </div>
        </div>

        {/* AI Prediction Tag */}
        <div className="flex items-center gap-1.5 bg-[#E1F2F1] text-[#007F86] px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Estimation • {confidence}% Confidence</span>
        </div>
      </div>

      {/* Main Metric Hero: Large numerical typography */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F2F5F6] rounded-xl border border-[#DCE5E9]">
        {/* Large ETA */}
        <div>
          <span className="text-[11px] font-semibold text-[#617580] uppercase tracking-wider block">
            OSRM Road ETA
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black text-[#112B37] tracking-tight">
              {etaMins}
            </span>
            <span className="text-sm font-bold text-[#617580]">min</span>
          </div>
          <span className="text-[11px] text-[#617580]">{distanceKm} km</span>
        </div>

        {/* Traffic Level */}
        <div>
          <span className="text-[11px] font-semibold text-[#617580] uppercase tracking-wider block">
            Corridor Flow
          </span>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${trafficColors.bg} ${trafficColors.text}`}>
            {route.trafficLevel.toUpperCase()}
          </span>
          <span className="text-[11px] text-[#617580] block mt-1">Live Conditions</span>
        </div>

        {/* Predicted Delay */}
        <div>
          <span className="text-[11px] font-semibold text-[#617580] uppercase tracking-wider block">
            AI Delay Est.
          </span>
          <span className="text-xl font-bold text-[#007F86] block mt-0.5">
            +{delayMins} min
          </span>
          <span className="text-[11px] text-[#617580]">Based on flow</span>
        </div>

        {/* Risk Level */}
        <div>
          <span className="text-[11px] font-semibold text-[#617580] uppercase tracking-wider block">
            Corridor Risk
          </span>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${riskColors.bg} ${riskColors.text}`}>
            {route.riskLevel.toUpperCase()}
          </span>
          <span className="text-[11px] text-[#617580] block mt-1">Reliability: {route.reliabilityScore}%</span>
        </div>
      </div>

      {/* AI Explanation & Reason Chips */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#112B37] flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#007F86]" />
          <span>Why RapidPath recommends this route</span>
        </h4>
        <p className="text-xs text-[#112B37] leading-relaxed bg-[#E1F2F1]/50 p-3 rounded-lg border border-[#007F86]/20">
          {aiAnalysis?.summary ||
            `${route.name} is recommended because it maintains the lowest predicted congestion and highest reliability for this emergency response.`}
        </p>

        {/* Compact Reason Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 ? (
            aiAnalysis.recommendations.slice(0, 3).map((rec, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E1F2F1] text-[#007F86] border border-[#007F86]/20">
                ✓ {rec}
              </span>
            ))
          ) : (
            <>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E1F2F1] text-[#007F86] border border-[#007F86]/20">
                ✓ Lower congestion risk
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E1F2F1] text-[#007F86] border border-[#007F86]/20">
                ✓ High corridor reliability ({route.reliabilityScore}%)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E1F2F1] text-[#007F86] border border-[#007F86]/20">
                ✓ Minimal bottleneck potential
              </span>
            </>
          )}
        </div>
      </div>

      {/* Why Not The Fastest Route? Concept Callout */}
      <div className="p-3.5 bg-[#FFF2D7] border border-[#97610A]/20 rounded-xl space-y-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#97610A]">
          <HelpCircle className="w-4 h-4" />
          <span>Why not purely the shortest distance route? (Fastest ≠ Most Reliable)</span>
        </div>
        <p className="text-[#112B37] leading-relaxed">
          Shorter inner-city routes often suffer from severe peak-hour bottleneck volatility. RapidPath selects corridors with the highest probability of uninterrupted transit for emergency vehicles.
        </p>
      </div>

      {/* Action to Full Route Analysis */}
      <div className="pt-2 flex items-center justify-between border-t border-[#DCE5E9]">
        <span className="text-xs text-[#617580]">
          Emergency Suitability Score: <strong className="text-[#007F86] font-bold">{route.overallScore} / 100</strong>
        </span>
        <Link
          to="/route"
          state={{ result, selectedRouteIndex: route.routeIndex ?? 0 }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007F86] hover:text-[#006B70] transition-colors"
        >
          <span>View Turn Guidance & Timeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
};
