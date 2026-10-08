import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Cpu, 
  Server,
  Bell
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [defaultVehicle, setDefaultVehicle] = useState('ambulance');
  const [defaultPriority, setDefaultPriority] = useState('critical');
  const [routeStrategy, setRouteStrategy] = useState('reliability');
  const [trafficLayer, setTrafficLayer] = useState(true);
  const [autoCenter, setAutoCenter] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [disruptionAlerts, setDisruptionAlerts] = useState(true);
  const [aiUpdates, setAiUpdates] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title (Section 28) */}
      <div className="pb-4 border-b border-[#DCE5E9]">
        <h1 className="text-2xl font-black text-[#112B37]">Settings</h1>
        <p className="text-xs sm:text-sm text-[#617580] mt-0.5">
          Configure default emergency parameters, map views, and live alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Route Preferences (Section 28) */}
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#112B37] uppercase tracking-wider pb-2 border-b border-[#DCE5E9]">
            Route Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Default Vehicle"
              value={defaultVehicle}
              onChange={(e) => setDefaultVehicle(e.target.value)}
              options={[
                { value: 'ambulance', label: 'Ambulance' },
                { value: 'fire_engine', label: 'Fire Engine' },
                { value: 'police', label: 'Police Vehicle' },
                { value: 'rescue', label: 'Rescue Vehicle' },
              ]}
            />

            <Select
              label="Default Emergency Priority"
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value)}
              options={[
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />

            <Select
              label="Preferred Route Strategy"
              value={routeStrategy}
              onChange={(e) => setRouteStrategy(e.target.value)}
              options={[
                { value: 'reliability', label: 'High Reliability (Recommended)' },
                { value: 'fastest', label: 'Fastest ETA' },
                { value: 'balanced', label: 'Balanced Corridor' },
              ]}
            />
          </div>
        </Card>

        {/* Section 2: Map Preferences (Section 28) */}
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#112B37] uppercase tracking-wider pb-2 border-b border-[#DCE5E9]">
            Map Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-[#112B37] block">Traffic Layer</span>
                <span className="text-[11px] text-[#617580]">Display live traffic conditions overlay on maps</span>
              </div>
              <input
                type="checkbox"
                checked={trafficLayer}
                onChange={(e) => setTrafficLayer(e.target.checked)}
                className="w-4 h-4 rounded text-[#007F86] focus:ring-[#007F86]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-[#112B37] block">Auto-Center</span>
                <span className="text-[11px] text-[#617580]">Automatically center and fit bounds on active corridors</span>
              </div>
              <input
                type="checkbox"
                checked={autoCenter}
                onChange={(e) => setAutoCenter(e.target.checked)}
                className="w-4 h-4 rounded text-[#007F86] focus:ring-[#007F86]"
              />
            </label>
          </div>
        </Card>

        {/* Section 3: Notifications (Section 28) */}
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#112B37] uppercase tracking-wider pb-2 border-b border-[#DCE5E9] flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#007F86]" />
            <span>Notifications & Alerts</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-[#112B37] block">Potential Delay Alerts</span>
                <span className="text-[11px] text-[#617580]">Notify when predicted congestion exceeds +3 minutes</span>
              </div>
              <input
                type="checkbox"
                checked={delayAlerts}
                onChange={(e) => setDelayAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#007F86] focus:ring-[#007F86]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-[#112B37] block">Route Disruption Alerts</span>
                <span className="text-[11px] text-[#617580]">Notify on sudden roadblock or incident reports</span>
              </div>
              <input
                type="checkbox"
                checked={disruptionAlerts}
                onChange={(e) => setDisruptionAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#007F86] focus:ring-[#007F86]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-[#112B37] block">AI Recommendation Updates</span>
                <span className="text-[11px] text-[#617580]">Real-time Gemini corridor advice refresh</span>
              </div>
              <input
                type="checkbox"
                checked={aiUpdates}
                onChange={(e) => setAiUpdates(e.target.checked)}
                className="w-4 h-4 rounded text-[#007F86] focus:ring-[#007F86]"
              />
            </label>
          </div>
        </Card>

        {/* Section 4: System Status (Section 28: Green #24735B for Connected/Operational) */}
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#112B37] uppercase tracking-wider pb-2 border-b border-[#DCE5E9]">
            System Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#007F86]" />
                <span className="font-semibold text-[#112B37]">Google Maps</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F5ED] text-[#24735B]">
                Connected
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#007F86]" />
                <span className="font-semibold text-[#112B37]">Gemini AI</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F5ED] text-[#24735B]">
                Connected
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#007F86]" />
                <span className="font-semibold text-[#112B37]">Backend</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F5ED] text-[#24735B]">
                Operational
              </span>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-[#24735B] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings successfully saved
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
              Save Preferences
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
