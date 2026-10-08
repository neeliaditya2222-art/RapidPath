import React from 'react';
import { Shield, Cpu, MapPin, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#DCE5E9] text-[#617580] py-6 px-4 sm:px-6 lg:px-8 mt-auto text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#E1F2F1] text-[#007F86] flex items-center justify-center font-bold">
            RP
          </div>
          <div>
            <p className="font-semibold text-[#112B37]">RapidPath Emergency Vehicle Route Intelligence</p>
            <p className="text-[11px] text-[#617580]">Every Second. Every Route. Every Life.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
          <div className="flex items-center gap-1.5 text-[#617580]">
            <Cpu className="w-3.5 h-3.5 text-[#007F86]" />
            <span>Google Gemini AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#617580]">
            <MapPin className="w-3.5 h-3.5 text-[#007F86]" />
            <span>Google Maps Platform</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#617580]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#24735B]" />
            <span>Deterministic Reliability Engine</span>
          </div>
        </div>

        <div className="text-right text-[11px] text-[#617580]">
          <p>© {new Date().getFullYear()} RapidPath. Built for Emergency Dispatch Operations.</p>
        </div>
      </div>
    </footer>
  );
};
