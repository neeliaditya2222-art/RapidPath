import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../services/authService';
import { 
  ArrowLeft, 
  Clock, 
  Compass, 
  Navigation, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Hospital
} from 'lucide-react';
import { RouteAnalysisResult, NormalizedRoute } from '../types';

interface RouteData {
  id: string;
  name: string;
  letter: 'A' | 'B' | 'C';
  badge: string;
  badgeClass: string;
  eta: string;
  distance: string;
  delay: string;
  trafficLevel: string;
  trafficClass: string;
  riskLevel: string;
  riskClass: string;
  score: number;
  origin: string;
  destination: string;
  segments: {
    num: number;
    title: string;
    traffic: string;
    trafficClass: string;
    impact: string;
    bgClass: string;
  }[];
  steps: {
    icon: string;
    distance: string;
    instruction: string;
    note: string;
  }[];
  recommendationReason: string;
  risks: string[];
  whyNotThis: string;
  isRecommended: boolean;
}

export const RoutePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  // Load latest route analysis result from location state or sessionStorage
  const activeResult: RouteAnalysisResult | null = useMemo(() => {
    if (location.state?.result) {
      return location.state.result as RouteAnalysisResult;
    }
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        return JSON.parse(stored) as RouteAnalysisResult;
      }
    } catch (e) {
      console.warn('Failed to parse sessionStorage route result:', e);
    }
    return null;
  }, [location.state]);

  // Transform backend/live routes into Route A, Route B, and Route C details
  const routesData: Record<'A' | 'B' | 'C', RouteData> | null = useMemo(() => {
    if (!activeResult || !activeResult.routes || activeResult.routes.length === 0) {
      return null;
    }

    const letters: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
    const originName = activeResult.origin?.address || 'Current GPS Location';
    const destName = activeResult.destination?.address || 'Emergency Medical Destination';
    const aiAnalysis = activeResult.aiAnalysis;

    const resultRecord = {} as Record<'A' | 'B' | 'C', RouteData>;

    letters.forEach((letter, idx) => {
      const r: NormalizedRoute = activeResult.routes[idx] || activeResult.routes[0];
      const isRec = r.isRecommended || idx === activeResult.recommendedRouteIndex;
      const etaMins = Math.round(r.durationSeconds / 60);
      const distKm = (r.distanceMeters / 1000).toFixed(1);
      const delayMins = Math.max(1, Math.round(r.predictedDelaySeconds / 60));

      const trafficLevelText =
        r.trafficLevel === 'low'
          ? 'Low Traffic'
          : r.trafficLevel === 'moderate'
          ? 'Moderate Traffic'
          : 'Heavy Traffic';

      const trafficClass =
        r.trafficLevel === 'low'
          ? 'text-[#24735B] bg-[#E8F5ED]'
          : r.trafficLevel === 'moderate'
          ? 'text-[#97610A] bg-[#FFF2D7]'
          : 'text-[#C73540] bg-[#FCECEE]';

      const riskLevelText =
        r.riskLevel === 'low'
          ? 'Low Risk'
          : r.riskLevel === 'medium'
          ? 'Medium Risk'
          : 'High Risk';

      const riskClass =
        r.riskLevel === 'low'
          ? 'text-[#24735B] bg-[#E8F5ED]'
          : r.riskLevel === 'medium'
          ? 'text-[#97610A] bg-[#FFF2D7]'
          : 'text-[#C73540] bg-[#FCECEE]';

      const badge = isRec
        ? 'AI Recommended'
        : idx === 0
        ? 'Fastest Direct'
        : 'Alternative Bypass';

      const badgeClass = isRec
        ? 'bg-[#E8F5ED] text-[#24735B] border-[#24735B]/30'
        : idx === 0
        ? 'bg-[#FFF2D7] text-[#97610A] border-[#97610A]/30'
        : 'bg-[#F2F5F6] text-[#617580] border-[#DCE5E9]';

      // Segments
      let segments = [
        {
          num: 1,
          title: `Segment 1: ${idx === 0 ? 'Primary City Arterial' : idx === 1 ? 'Outer Perimeter Bypass' : 'Secondary Avenue Corridor'}`,
          traffic: trafficLevelText,
          trafficClass: r.trafficLevel === 'low' ? 'text-[#24735B]' : r.trafficLevel === 'moderate' ? 'text-[#97610A]' : 'text-[#C73540]',
          impact: `ETA impact: +${delayMins} min (${trafficLevelText})`,
          bgClass: r.trafficLevel === 'low' ? 'bg-[#F2F5F6] border-[#DCE5E9]' : r.trafficLevel === 'moderate' ? 'bg-[#FFF2D7]/40 border-[#DCE5E9]' : 'bg-[#FCECEE] border-[#C73540]/30',
        },
        {
          num: 2,
          title: `Segment 2: ${idx === 0 ? 'Central Commercial Flyover' : idx === 1 ? 'Expressway Elevated Link' : 'Civic Sector Boulevard'}`,
          traffic: idx === 1 ? 'Clear Green Flow' : 'Standard Traffic Flow',
          trafficClass: idx === 1 ? 'text-[#007F86]' : 'text-[#97610A]',
          impact: `Transit stability: ${r.reliabilityScore}% reliability score`,
          bgClass: idx === 1 ? 'bg-[#E1F2F1]/50 border-[#007F86]/30' : 'bg-[#F2F5F6] border-[#DCE5E9]',
        },
        {
          num: 3,
          title: `Segment 3: Emergency Hospital Access Approach`,
          traffic: 'Emergency Lane Open',
          trafficClass: 'text-[#24735B]',
          impact: 'ETA impact: 0 min (Priority gate clearance)',
          bgClass: 'bg-[#F2F5F6] border-[#DCE5E9]',
        },
      ];

      // Navigation Steps
      let steps = [
        {
          icon: '↑',
          distance: 'In 500 m',
          instruction: `Proceed along ${r.name || `Corridor ${letter}`}`,
          note: `Maintain sirens for priority right-of-way (${distKm} km total)`,
        },
        {
          icon: '↱',
          distance: `In ${(parseFloat(distKm) * 0.6).toFixed(1)} km`,
          instruction: `Merge toward ${destName}`,
          note: `Hospital trauma approach active with ~${etaMins} min ETA`,
        },
      ];

      // Single route analysis from Gemini if available
      const singleAi = aiAnalysis?.routeAnalyses?.find((a) => a.routeIndex === idx);
      const recommendationReason =
        singleAi?.reasoning ||
        (isRec
          ? `Prioritized for emergency response. Maintained ${r.reliabilityScore}% corridor reliability with low traffic congestion and high transit stability.`
          : idx === 0
          ? `Direct geometric route (${distKm} km), but higher traffic buildup may cause unexpected delays.`
          : `Viable secondary corridor with moderate traffic, suitable if primary routes encounter blockades.`);

      const risks =
        singleAi?.riskFactors && singleAi.riskFactors.length > 0
          ? singleAi.riskFactors
          : isRec
          ? ['Minor arterial merge delay (+1 min)', `Distance: ${distKm} km with high speed flow`]
          : idx === 0
          ? [`Congestion along central corridor (+${delayMins} min delay)`, 'Higher cross-traffic signal frequency']
          : [`Extended transit distance (${distKm} km)`, 'Multiple intersection signal cycles'];

      const whyNotThis = isRec
        ? `Route ${letter} is the optimal recommended corridor.`
        : `Route ${letter} has lower emergency suitability (${r.overallScore}/100) compared to the AI Recommended corridor.`;

      resultRecord[letter] = {
        id: r.id || `route-${letter.toLowerCase()}`,
        name: r.name || `Route ${letter}`,
        letter,
        badge,
        badgeClass,
        eta: `${etaMins} min`,
        distance: `${distKm} km`,
        delay: `+${delayMins} min delay`,
        trafficLevel: trafficLevelText,
        trafficClass,
        riskLevel: riskLevelText,
        riskClass,
        score: r.overallScore || 85,
        origin: originName,
        destination: destName,
        segments,
        steps,
        recommendationReason,
        risks,
        whyNotThis,
        isRecommended: isRec,
      };
    });

    return resultRecord;
  }, [activeResult]);

  // Determine initial selected route tab ('A' | 'B' | 'C') based on AI recommendation or navigation state
  const defaultSelectedLetter = useMemo<'A' | 'B' | 'C'>(() => {
    if (location.state?.selectedRouteIndex !== undefined) {
      const idx = location.state.selectedRouteIndex;
      return idx === 0 ? 'A' : idx === 1 ? 'B' : 'C';
    }
    if (activeResult?.recommendedRouteIndex !== undefined) {
      const idx = activeResult.recommendedRouteIndex;
      return idx === 0 ? 'A' : idx === 1 ? 'B' : 'C';
    }
    if (routesData) {
      const found = (['A', 'B', 'C'] as const).find((l) => routesData[l]?.isRecommended);
      if (found) return found;
    }
    return 'A';
  }, [location.state, activeResult, routesData]);

  const [activeRouteLetter, setActiveRouteLetter] = useState<'A' | 'B' | 'C'>(defaultSelectedLetter);

  // Sync active route letter when route data or recommendation loads
  useEffect(() => {
    setActiveRouteLetter(defaultSelectedLetter);
  }, [defaultSelectedLetter]);

  // If no destination has been selected on Dashboard yet
  if (!routesData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E1F2F1] text-[#007F86] mx-auto flex items-center justify-center text-3xl shadow-sm">
          🚑
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#112B37]">No Active Destination Selected</h1>
          <p className="text-sm text-[#617580] max-w-md mx-auto">
            Please select an emergency destination or nearby hospital on the Emergency Route Planner. Route A, Route B, and Route C will then be analyzed here in real-time.
          </p>
        </div>
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007F86] text-white font-bold text-sm hover:bg-[#00666C] shadow-sm transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Go to Emergency Route Planner</span>
          </Link>
        </div>
      </div>
    );
  }

  const current = routesData[activeRouteLetter] || routesData['A'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Route Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5E9]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-[#617580] hover:text-[#112B37] p-1.5 rounded-lg hover:bg-[#F2F5F6] transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-[#112B37]">{current.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.badgeClass}`}>
              {current.badge}
            </span>
          </div>
          <p className="text-xs text-[#617580] ml-9">
            {current.origin} → <strong className="text-[#112B37]">{current.destination}</strong>
          </p>
        </div>

        {/* Dynamic Route A / Route B / Route C Selector Buttons matching AI Recommendations */}
        <div className="flex items-center gap-1.5 bg-[#F2F5F6] p-1 rounded-xl border border-[#DCE5E9]">
          {(['A', 'B', 'C'] as const).map((letter) => {
            const r = routesData[letter];
            if (!r) return null;
            const isSelected = activeRouteLetter === letter;
            const isRec = r.isRecommended;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setActiveRouteLetter(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isRec
                      ? 'bg-[#007F86] text-white shadow-sm'
                      : 'bg-[#112B37] text-white shadow-sm'
                    : isRec
                    ? 'text-[#007F86] font-bold hover:bg-[#E1F2F1]'
                    : 'text-[#617580] hover:text-[#112B37]'
                }`}
              >
                <span>Route {letter}</span>
                <span className="text-[10px] opacity-90 font-semibold">
                  ({isRec ? 'AI Recommended' : r.badge})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Corridor Comparison Cards (Route A, Route B, Route C) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#617580] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#007F86]" />
            Compare Corridors for Selected Destination
          </span>
          <span className="text-xs text-[#617580]">Click any corridor card to inspect deep analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['A', 'B', 'C'] as const).map((letter) => {
            const r = routesData[letter];
            const isSelected = activeRouteLetter === letter;
            return (
              <div
                key={letter}
                onClick={() => setActiveRouteLetter(letter)}
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-2 border-[#007F86] shadow-md ring-2 ring-[#007F86]/20'
                    : r.isRecommended
                    ? 'bg-white border-2 border-[#007F86]/40 shadow-xs hover:border-[#007F86]'
                    : 'bg-white border border-[#DCE5E9] hover:border-[#617580] shadow-sm'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#112B37] text-sm flex items-center gap-1.5">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-[#007F86] text-white' : 'bg-[#E1F2F1] text-[#007F86]'
                      }`}>
                        {letter}
                      </span>
                      {r.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.badgeClass}`}>
                      {r.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-black text-[#112B37]">{r.eta}</span>
                      <span className="text-xs text-[#617580] ml-1.5">{r.distance}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${r.trafficClass}`}>
                      {r.trafficLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DCE5E9] text-[#617580]">
                    <span>Score: <strong className="text-[#112B37]">{r.score}/100</strong></span>
                    <span>{r.delay}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border border-[#DCE5E9]">
          <span className="text-xs text-[#617580] font-medium">Estimated Arrival</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-[#112B37]">{current.eta}</span>
          </div>
          <span className="text-[11px] text-[#617580]">{current.distance}</span>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5E9]">
          <span className="text-xs text-[#617580] font-medium">Traffic Conditions</span>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${current.trafficClass}`}>
              {current.trafficLevel}
            </span>
          </div>
          <span className="text-[11px] text-[#617580] block mt-1">{current.delay}</span>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5E9]">
          <span className="text-xs text-[#617580] font-medium">Risk Assessment</span>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${current.riskClass}`}>
              {current.riskLevel}
            </span>
          </div>
          <span className="text-[11px] text-[#617580] block mt-1">Corridor stability</span>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5E9]">
          <span className="text-xs text-[#617580] font-medium">Overall Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-[#007F86]">{current.score}</span>
            <span className="text-xs text-[#617580]">/100</span>
          </div>
          <span className="text-[11px] text-[#617580]">Reliability index</span>
        </Card>
      </div>

      {/* Main Two-Column Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vertical Route Timeline - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#617580] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#007F86]" />
              <span>{current.name} Segment Timeline</span>
            </h2>

            {/* Vertical Route Timeline Sequence */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE5E9]">
              {/* Origin */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#007F86] border-2 border-white flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#112B37]">Emergency Origin</h3>
                  <p className="text-xs text-[#617580] mt-0.5">Ambulance dispatched from {current.origin}</p>
                </div>
              </div>

              {/* Dynamic Segments for Active Route */}
              {current.segments.map((seg) => (
                <div key={seg.num} className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#E1F2F1] border-2 border-[#007F86] text-[#007F86] flex items-center justify-center text-[10px] font-bold">
                    {seg.num}
                  </div>
                  <div className={`p-3 rounded-lg border ${seg.bgClass}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#112B37]">{seg.title}</h4>
                      <span className={`text-[11px] font-semibold ${seg.trafficClass}`}>{seg.traffic}</span>
                    </div>
                    <p className="text-[11px] text-[#617580] mt-1">{seg.impact}</p>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#C73540] border-2 border-white flex items-center justify-center text-white text-[10px]">
                  +
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#C73540]">Target Destination</h3>
                  <p className="text-xs text-[#112B37] font-semibold mt-0.5">{current.destination}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Turn-by-Turn Guidance & AI Intelligence (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Turn-by-Turn Guidance Panel */}
          <div className="p-6 bg-[#102E3C] rounded-xl text-white shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A4254]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#007F86] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#007F86]" />
                <span className="text-white">{current.name} Navigation Steps</span>
              </h2>
              <span className="text-xs text-[#007F86] font-semibold">Active Dispatch Mode</span>
            </div>

            <div className="space-y-3">
              {current.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-[#0A1E27]/60 border border-[#1A4254]">
                  <div className="w-8 h-8 rounded-lg bg-[#007F86] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <span className="text-xs text-[#007F86] font-bold uppercase">{step.distance}</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{step.instruction}</p>
                    <p className="text-xs text-[#617580] mt-0.5">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini Route Intelligence Panel */}
          <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E9]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#112B37] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#007F86]" />
                <span>Gemini Intelligence for {current.name}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E1F2F1] text-[#007F86]">
                Score: {current.score}/100
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-[#112B37]">
              <div>
                <span className="text-[11px] font-semibold text-[#617580] uppercase tracking-wider block">
                  Assessment
                </span>
                <p className="mt-0.5 leading-relaxed font-medium">{current.recommendationReason}</p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#617580] uppercase tracking-wider block">
                  Identified Risk Factors
                </span>
                <ul className="mt-1 space-y-1 text-[#617580]">
                  {current.risks.map((risk, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#97610A]" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!current.isRecommended && (
                <div className="p-3 bg-[#F2F5F6] rounded-lg border border-[#DCE5E9]">
                  <span className="text-[11px] font-bold text-[#112B37] uppercase tracking-wider block">
                    Comparative Evaluation vs Recommended Corridor
                  </span>
                  <p className="text-[#617580] mt-1 leading-relaxed">
                    {current.whyNotThis}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
