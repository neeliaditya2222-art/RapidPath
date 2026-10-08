import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../services/authService';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section (Section 33) */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F2F1] text-[#007F86] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#007F86]" />
            <span>Emergency Vehicle Route Intelligence</span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black text-[#112B37] tracking-tight">
              Rapid<span className="text-[#007F86]">Path</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-[#102E3C]">
              Every Second. Every Route. Every Life.
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#617580] leading-relaxed max-w-2xl mx-auto">
            AI-powered emergency route intelligence that analyzes traffic and route conditions, predicts potential delays, and helps emergency vehicles choose smarter routes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-sm font-semibold"
              >
                Plan Emergency Route
              </Button>
            </Link>

            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Visual Mockup: Stylized Map with Recommended Teal Route */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white border border-[#DCE5E9] p-4 shadow-elevated">
          <div className="bg-[#EDF1F0] rounded-xl p-6 relative overflow-hidden h-72 sm:h-80 flex flex-col justify-between border border-[#DCE5E9]">
            {/* Top Bar on Map */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-white/95 px-3 py-1.5 rounded-lg border border-[#DCE5E9] text-xs font-semibold text-[#112B37] shadow-sm">
                Active Corridor: <strong className="text-[#007F86]">Route B (11 min • 6.4 km)</strong>
              </div>
              <div className="bg-[#E8F5ED] text-[#24735B] px-2.5 py-1 rounded-full text-xs font-bold border border-[#24735B]/20">
                ✓ AI Recommended
              </div>
            </div>

            {/* Stylized visual routes graphic */}
            <div className="relative w-full h-full flex items-center justify-center">
              <svg className="w-full h-44" viewBox="0 0 600 200" fill="none">
                {/* Background Grid Roads */}
                <path d="M50 150 Q 200 120 350 160 T 550 50" stroke="#DCE5E9" strokeWidth="12" />
                <path d="M50 50 Q 180 80 320 40 T 550 150" stroke="#DCE5E9" strokeWidth="12" />
                
                {/* Route A (Muted + Hazard) */}
                <path d="M60 140 C 180 140, 240 60, 540 60" stroke="#617580" strokeWidth="4" strokeDasharray="6 6" />
                
                {/* Route B (Recommended Teal Glow) */}
                <path d="M60 140 C 150 180, 380 180, 540 60" stroke="#007F86" strokeWidth="10" strokeOpacity="0.25" strokeLinecap="round" />
                <path d="M60 140 C 150 180, 380 180, 540 60" stroke="#007F86" strokeWidth="5" strokeLinecap="round" />

                {/* Origin Pin */}
                <circle cx="60" cy="140" r="10" fill="#007F86" stroke="#FFFFFF" strokeWidth="3" />
                {/* Destination Pin */}
                <circle cx="540" cy="60" r="12" fill="#C73540" stroke="#FFFFFF" strokeWidth="3" />

                {/* Vehicle Marker */}
                <rect x="230" y="160" width="24" height="16" rx="4" fill="#102E3C" />
                <circle cx="242" cy="168" r="3" fill="#007F86" />

                {/* Hazard Marker on Route A */}
                <rect x="250" y="85" width="18" height="18" rx="3" fill="#97610A" transform="rotate(45 259 94)" />
              </svg>
            </div>

            {/* Bottom floating summary pill */}
            <div className="flex items-center justify-between text-xs z-10">
              <span className="text-[#617580] bg-white/90 px-2.5 py-1 rounded border border-[#DCE5E9]">
                Origin: Secunderabad
              </span>
              <span className="text-[#C73540] font-semibold bg-white/90 px-2.5 py-1 rounded border border-[#DCE5E9]">
                Target: Apollo Hospital
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Section 34: 4 Simple Steps) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#112B37]">
            How RapidPath Works
          </h2>
          <p className="text-sm text-[#617580] mt-1">
            4-step intelligent decision workflow for emergency mobility
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <Card className="p-6 bg-white border border-[#DCE5E9] space-y-3">
            <span className="text-xs font-black text-[#007F86] uppercase tracking-widest">
              01
            </span>
            <h3 className="text-base font-bold text-[#112B37]">Enter Emergency</h3>
            <p className="text-xs text-[#617580] leading-relaxed">
              Enter origin, destination, vehicle class, and urgency priority.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="p-6 bg-white border border-[#DCE5E9] space-y-3">
            <span className="text-xs font-black text-[#007F86] uppercase tracking-widest">
              02
            </span>
            <h3 className="text-base font-bold text-[#112B37]">Analyze Routes</h3>
            <p className="text-xs text-[#617580] leading-relaxed">
              RapidPath retrieves available route and traffic information.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="p-6 bg-white border border-[#DCE5E9] space-y-3">
            <span className="text-xs font-black text-[#007F86] uppercase tracking-widest">
              03
            </span>
            <h3 className="text-base font-bold text-[#112B37]">AI Prediction</h3>
            <p className="text-xs text-[#617580] leading-relaxed">
              Gemini analyzes route conditions and potential delay risks.
            </p>
          </Card>

          {/* Step 4 */}
          <Card className="p-6 bg-white border border-[#DCE5E9] space-y-3">
            <span className="text-xs font-black text-[#007F86] uppercase tracking-widest">
              04
            </span>
            <h3 className="text-base font-bold text-[#112B37]">Choose Smarter</h3>
            <p className="text-xs text-[#617580] leading-relaxed">
              RapidPath highlights the most suitable route when every second matters.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#102E3C] rounded-2xl p-8 sm:p-12 text-center space-y-4 text-white">
          <h2 className="text-2xl sm:text-3xl font-black">
            Every Second Counts in Emergency Transit
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience smart corridor selection powered by Google Maps and Gemini AI.
          </p>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="primary" size="lg" className="font-semibold shadow-md">
                Launch Emergency Route Planner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
