import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AIDelayPredictionCardProps {
  predictedDelayMinutes?: number;
  confidenceScore?: number;
  riskFactors?: string[];
  recommendationReason?: string;
}

export const AIDelayPredictionCard: React.FC<AIDelayPredictionCardProps> = ({
  predictedDelayMinutes = 1,
  confidenceScore = 88,
  riskFactors = [
    'Minor peak-hour arterial slowdown',
    'Historical intersection queueing near bridge',
    'Corridor maintains overall high reliability',
  ],
  recommendationReason,
}) => {
  return (
    <Card className="p-5 bg-[#E1F2F1] border border-[#007F86]/20 shadow-sm space-y-3">
      {/* Header with AI Prediction badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#007F86] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>AI Delay & Risk Estimation</span>
        </h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#007F86] border border-[#007F86]/20">
          AI Analysis
        </span>
      </div>

      {/* Main Number & Confidence */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#112B37]">+{predictedDelayMinutes}</span>
            <span className="text-sm font-bold text-[#617580]">min</span>
          </div>
          <p className="text-[11px] text-[#617580] mt-0.5 font-medium">
            AI-estimated potential delay based on available route and traffic conditions.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-[#007F86] block">Confidence: {confidenceScore}%</span>
          <span className="text-[10px] text-[#617580]">Gemini AI</span>
        </div>
      </div>

      {/* Potential Risk Factors */}
      <div className="space-y-1.5 pt-2 border-t border-[#007F86]/20 text-xs text-[#112B37]">
        <p className="font-semibold text-[11px] text-[#617580] uppercase tracking-wider">
          AI Assessment Factors:
        </p>
        <ul className="space-y-1 text-xs text-[#112B37]">
          {riskFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007F86] mt-1.5 flex-shrink-0" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {recommendationReason && (
        <div className="p-2.5 bg-white/80 rounded-lg border border-[#007F86]/20 text-[11px] text-[#112B37]">
          <span className="font-bold text-[#007F86]">Recommendation Note: </span>
          {recommendationReason}
        </div>
      )}
    </Card>
  );
};

export const HazardAlert: React.FC<{
  title?: string;
  impact?: string;
  description?: string;
  alternative?: string;
}> = ({
  title = 'Potential Delay Ahead',
  impact = '+3–4 min',
  description = 'Moderate congestion detected on Route A near downtown corridor.',
  alternative = 'Route B currently shows lower delay risk and higher corridor reliability.',
}) => {
  return (
    <div className="p-4 rounded-xl bg-[#FFF2D7] border border-[#97610A]/30 text-xs space-y-1.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#97610A] uppercase tracking-wide flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-[#97610A]" />
          <span>{title}</span>
        </span>
        <span className="font-semibold text-[#97610A] bg-white px-2 py-0.5 rounded border border-[#97610A]/20">
          Impact: {impact}
        </span>
      </div>
      <p className="text-[#112B37] font-medium">
        {description}
      </p>
      {alternative && (
        <p className="text-[#617580] pt-1">
          Alternative: <strong className="text-[#007F86]">{alternative}</strong>
        </p>
      )}
    </div>
  );
};
