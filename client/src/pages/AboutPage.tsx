import React from 'react';
import { Card } from '../components/ui/Card';
import { 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Lock, 
  Activity, 
  Scale, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-[#112B37]">
      {/* Header */}
      <div className="pb-4 border-b border-[#DCE5E9] space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#112B37]">
          System Architecture & Safety Engineering
        </h1>
        <p className="text-xs sm:text-sm text-[#617580]">
          Technical design principles, mathematical scoring formulas, and AI safety protocols
        </p>
      </div>

      {/* Section 1: Problem & Solution */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#112B37] uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#007F86]" />
          <span>1. Operational Challenge & Core Mission</span>
        </h2>
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-3 text-xs text-[#112B37] leading-relaxed">
          <p>
            Emergency medical services (EMS), fire rescue apparatus, and tactical police vehicles operate in dynamic urban environments where every 60 seconds gained increases cardiac arrest survival rates by up to 10%.
          </p>
          <p className="text-[#617580]">
            Conventional navigation systems default to shortest distance or narrow surface streets that carry hidden emergency risks: high signal density, left-turn blockages, tight turning radii for 30-ton ladder trucks, and sudden congestion bottlenecks.
          </p>
          <div className="p-3 bg-[#E1F2F1] rounded-lg border border-[#007F86]/20 font-semibold text-[#007F86]">
            RapidPath combines Google Maps live routing ground-truth with Google Gemini AI risk assessment and a deterministic scoring engine to recommend the most reliable emergency corridor.
          </div>
        </Card>
      </section>

      {/* Section 2: Mathematical Scoring Formula */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#112B37] uppercase tracking-wide flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#007F86]" />
          <span>2. Deterministic Composite Scoring Formula</span>
        </h2>
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4 text-xs">
          <p className="text-[#617580]">
            Every candidate corridor is evaluated with deterministic physics-based formulas before AI verification:
          </p>

          <div className="bg-[#F2F5F6] p-4 rounded-lg border border-[#DCE5E9] font-mono text-[#102E3C] font-semibold space-y-1">
            <p>Composite Score (S) = (TimeScore × W_t) + (TrafficScore × W_c) + (RiskScore × W_r) + (Reliability × W_rel)</p>
            <p className="text-[11px] text-[#617580] font-normal">
              Where weights (W) are dynamically assigned based on vehicle class profile and urgency code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#F2F5F6] p-3 rounded-lg border border-[#DCE5E9]">
              <span className="font-bold text-[#112B37] block mb-1">Reliability Index (%)</span>
              <p className="text-[11px] text-[#617580]">
                Measures corridor variance. Calculated as: <code>100 - (DelayRatio × 45 × PenaltyWeight) - IncidentDeductions</code>
              </p>
            </div>

            <div className="bg-[#F2F5F6] p-3 rounded-lg border border-[#DCE5E9]">
              <span className="font-bold text-[#112B37] block mb-1">Vehicle Physics Factor</span>
              <p className="text-[11px] text-[#617580]">
                Applies turning penalties and apparatus width constraints (Fire Engine = 1.6x bottleneck penalty; Police Interceptor = 1.25x speed capacity).
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Section 3: Gemini AI Role & System Prompt */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#112B37] uppercase tracking-wide flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#007F86]" />
          <span>3. Gemini AI Structured System Prompt</span>
        </h2>
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-3 text-xs">
          <p className="text-[#617580]">
            Gemini is invoked exclusively from the secure Express backend using JSON mode and strict Zod schema validation. The AI is bounded by the following immutable system-level instructions:
          </p>

          <div className="bg-[#102E3C] p-4 rounded-lg text-[11px] font-mono text-[#E1F2F1] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-56 overflow-y-auto">
{`You are an emergency mobility route analysis AI.
Your responsibility is to analyze structured route information for emergency vehicles and determine which available route is most suitable for emergency response.
You are not a navigation engine.
You must never invent traffic incidents, road closures, accidents, or real-world events.
Only use the information provided in the input.
You may identify potential delay or risk based on route metrics, traffic information, and supplied event indicators, but these must be described as predictions or risk assessments rather than confirmed facts.
Return valid JSON matching the required schema.`}
          </div>
        </Card>
      </section>

      {/* Section 4: Security, Isolation & Safety Principles */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#112B37] uppercase tracking-wide flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#24735B]" />
          <span>4. Security & Safety Principles</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <Card className="p-4 bg-white border border-[#DCE5E9] space-y-1.5 shadow-sm">
            <span className="font-bold text-[#007F86] block">Server-Side Key Isolation</span>
            <p className="text-[#617580] text-[11px]">
              Gemini AI API keys and Google Maps Server keys exist only in server environment variables.
            </p>
          </Card>

          <Card className="p-4 bg-white border border-[#DCE5E9] space-y-1.5 shadow-sm">
            <span className="font-bold text-[#007F86] block">Row-Level Data Scoping</span>
            <p className="text-[#617580] text-[11px]">
              Every audit record and route request is scoped to authenticated operator credentials.
            </p>
          </Card>

          <Card className="p-4 bg-white border border-[#DCE5E9] space-y-1.5 shadow-sm">
            <span className="font-bold text-[#24735B] block">Fail-Safe Degraded Operation</span>
            <p className="text-[#617580] text-[11px]">
              If external APIs encounter network limits, the system smoothly degrades to deterministic local heuristics.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
