import React from 'react';
import { EmergencyPriority, IncidentType } from '../../types';
import { Siren, AlertTriangle, AlertCircle, Info, HeartPulse, Flame, Car, ShieldAlert, LifeBuoy } from 'lucide-react';

interface PrioritySelectorProps {
  value: EmergencyPriority;
  onChange: (priority: EmergencyPriority) => void;
}

const PRIORITIES: {
  priority: EmergencyPriority;
  label: string;
  code: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    priority: 'critical',
    label: 'Critical',
    code: 'Code 3 • Life Threat',
    activeClass: 'bg-[#FCECEE] border-[#C73540] text-[#C73540] shadow-sm',
    inactiveClass: 'bg-white border-[#DCE5E9] text-[#617580] hover:border-[#C73540]/50 hover:bg-[#FCECEE]/30',
  },
  {
    priority: 'high',
    label: 'High',
    code: 'Code 2 • Urgent',
    activeClass: 'bg-[#FFF2D7] border-[#97610A] text-[#97610A] shadow-sm',
    inactiveClass: 'bg-white border-[#DCE5E9] text-[#617580] hover:border-[#97610A]/50 hover:bg-[#FFF2D7]/30',
  },
  {
    priority: 'medium',
    label: 'Medium',
    code: 'Code 1 • Standard',
    activeClass: 'bg-[#FFF2D7] border-[#97610A] text-[#97610A] shadow-sm',
    inactiveClass: 'bg-white border-[#DCE5E9] text-[#617580] hover:border-[#97610A]/50 hover:bg-[#FFF2D7]/20',
  },
  {
    priority: 'low',
    label: 'Low',
    code: 'Scheduled Transport',
    activeClass: 'bg-[#E8F5ED] border-[#24735B] text-[#24735B] shadow-sm',
    inactiveClass: 'bg-white border-[#DCE5E9] text-[#617580] hover:border-[#24735B]/50 hover:bg-[#E8F5ED]/30',
  },
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
        Emergency Priority
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRIORITIES.map((p) => {
          const isSelected = value === p.priority;
          return (
            <button
              key={p.priority}
              type="button"
              onClick={() => onChange(p.priority)}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-150 ${
                isSelected
                  ? `${p.activeClass} border-2`
                  : p.inactiveClass
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold">{p.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className="text-[10px] mt-0.5 opacity-85 leading-tight">{p.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface IncidentSelectorProps {
  value?: IncidentType;
  onChange: (incident: IncidentType) => void;
}

const INCIDENTS: { type: IncidentType; label: string }[] = [
  { type: 'medical', label: 'Medical Emergency' },
  { type: 'accident', label: 'Accident' },
  { type: 'fire', label: 'Fire' },
  { type: 'crime', label: 'Crime' },
  { type: 'rescue', label: 'Rescue' },
  { type: 'natural_disaster', label: 'Natural Disaster' },
  { type: 'other', label: 'Other' },
];

export const IncidentSelector: React.FC<IncidentSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
        Incident Type
      </label>
      <div className="flex flex-wrap gap-1.5">
        {INCIDENTS.map((inc) => {
          const isSelected = value === inc.type;
          return (
            <button
              key={inc.type}
              type="button"
              onClick={() => onChange(inc.type)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-[#E1F2F1] text-[#007F86] border-[#007F86] font-semibold'
                  : 'bg-white text-[#617580] border-[#DCE5E9] hover:border-[#617580] hover:text-[#112B37]'
              }`}
            >
              {inc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
