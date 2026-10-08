import React from 'react';
import { ShieldCheck, Activity, Zap, Clock, TrendingDown } from 'lucide-react';

interface TelemetryStatsProps {
  corridorsCount: number;
  aiConfidence: number;
  avgReliability: number;
  savedDelaySeconds: number;
}

export const TelemetryStats: React.FC<TelemetryStatsProps> = ({
  corridorsCount,
  aiConfidence,
  avgReliability,
  savedDelaySeconds,
}) => {
  const savedMinutes = Math.max(1, Math.round(savedDelaySeconds / 60));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {/* Corridors Analyzed */}
      <div className="bg-tactical-900 border border-tactical-800 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Corridors Evaluated
          </span>
          <span className="text-xl font-black text-white">{corridorsCount || 3}</span>
        </div>
      </div>

      {/* AI Decision Confidence */}
      <div className="bg-tactical-900 border border-tactical-800 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            AI Confidence
          </span>
          <span className="text-xl font-black text-emerald-400">{aiConfidence || 92}%</span>
        </div>
      </div>

      {/* Mean Reliability */}
      <div className="bg-tactical-900 border border-tactical-800 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Mean Reliability
          </span>
          <span className="text-xl font-black text-cyan-400">{avgReliability || 88}%</span>
        </div>
      </div>

      {/* Avoided Delay */}
      <div className="bg-tactical-900 border border-tactical-800 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Estimated Delay Avoided
          </span>
          <span className="text-xl font-black text-amber-400">~{savedMinutes}m</span>
        </div>
      </div>
    </div>
  );
};
