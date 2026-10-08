import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Emergency Routing Safety Advisory" className="bg-[#FFF2D7] border-b border-[#97610A]/20 text-[#97610A] px-3 sm:px-4 py-2 text-xs flex items-center justify-between shadow-sm relative z-40">
      <div className="flex items-start sm:items-center gap-2 max-w-7xl mx-auto min-w-0 flex-1 pr-2">
        <AlertCircle className="w-4 h-4 text-[#97610A] shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-snug text-[11px] sm:text-xs">
          <strong className="font-semibold">EMERGENCY DECISION SUPPORT:</strong> This system provides decision-support recommendations based on available map, traffic, and AI analysis. It does not replace trained emergency dispatchers, official navigation systems, or real-time emergency-response protocols.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-[#97610A] hover:text-[#112B37] p-1 rounded transition-colors shrink-0"
        title="Dismiss advisory"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
