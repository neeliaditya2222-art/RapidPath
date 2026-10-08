import React from 'react';
import { VehicleType } from '../../types';
import { Ambulance, Flame, Shield, LifeBuoy, Truck } from 'lucide-react';

interface VehicleSelectorProps {
  value: VehicleType;
  onChange: (vehicle: VehicleType) => void;
}

const VEHICLES: {
  type: VehicleType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accent: string;
  borderColor: string;
}[] = [
  {
    type: 'ambulance',
    label: 'Ambulance',
    sublabel: 'EMS / Trauma Transport',
    icon: <Ambulance className="w-5 h-5" />,
    accent: 'text-red-400 bg-red-500/10',
    borderColor: 'border-red-500/50 shadow-red-500/10',
  },
  {
    type: 'fire_engine',
    label: 'Fire Engine',
    sublabel: 'Heavy Apparatus & Ladder',
    icon: <Flame className="w-5 h-5" />,
    accent: 'text-orange-400 bg-orange-500/10',
    borderColor: 'border-orange-500/50 shadow-orange-500/10',
  },
  {
    type: 'police',
    label: 'Police Unit',
    sublabel: 'Patrol & Interceptor',
    icon: <Shield className="w-5 h-5" />,
    accent: 'text-blue-400 bg-blue-500/10',
    borderColor: 'border-blue-500/50 shadow-blue-500/10',
  },
  {
    type: 'rescue',
    label: 'Rescue Unit',
    sublabel: 'Heavy Extrication / Hazmat',
    icon: <LifeBuoy className="w-5 h-5" />,
    accent: 'text-emerald-400 bg-emerald-500/10',
    borderColor: 'border-emerald-500/50 shadow-emerald-500/10',
  },
  {
    type: 'other',
    label: 'Support Vehicle',
    sublabel: 'Command / Utility Transport',
    icon: <Truck className="w-5 h-5" />,
    accent: 'text-purple-400 bg-purple-500/10',
    borderColor: 'border-purple-500/50 shadow-purple-500/10',
  },
];

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Emergency Vehicle Class
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {VEHICLES.map((v) => {
          const isSelected = value === v.type;
          return (
            <button
              key={v.type}
              type="button"
              onClick={() => onChange(v.type)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? `bg-tactical-800 ${v.borderColor} border-2 shadow-lg`
                  : 'bg-tactical-900 border-tactical-800 hover:border-tactical-700 hover:bg-tactical-850'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className={`p-1.5 rounded-lg ${v.accent}`}>{v.icon}</div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{v.label}</span>
              <span className="text-[10px] text-slate-400 line-clamp-1">{v.sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
