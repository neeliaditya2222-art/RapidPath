import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { historyApi } from '../api/routeApi';
import { HistoryItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getPriorityColor } from '../utils/formatters';
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Filter, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle2 
} from 'lucide-react';

const DEMO_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    createdAt: '2026-10-08T10:42:00.000Z',
    vehicleType: 'ambulance',
    emergencyPriority: 'critical',
    incidentType: 'medical',
    origin: { address: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
    destination: { address: 'Apollo Hospital', lat: 17.4172, lng: 78.4116 },
    recommendedRouteName: 'Route B',
    etaMinutes: 11,
    distanceMeters: 6400,
    overallScore: 94,
    trafficLevel: 'low',
    riskLevel: 'low',
    aiSummary: 'Route B recommended for lower congestion and high reliability.',
    confidenceScore: 92,
    routesCount: 3,
    notes: 'Critical Code 3 Dispatch',
  },
  {
    id: 'hist-2',
    createdAt: '2026-10-08T09:15:00.000Z',
    vehicleType: 'fire_engine',
    emergencyPriority: 'critical',
    incidentType: 'fire',
    origin: { address: 'Banjara Hills Fire Station', lat: 17.4156, lng: 78.4350 },
    destination: { address: 'Hitech City Complex', lat: 17.4435, lng: 78.3772 },
    recommendedRouteName: 'Route B (Flyover Bypass)',
    etaMinutes: 14,
    distanceMeters: 8900,
    overallScore: 91,
    trafficLevel: 'low',
    riskLevel: 'low',
    aiSummary: 'Arterial flyover bypass chosen for heavy apparatus width clearance.',
    confidenceScore: 90,
    routesCount: 3,
  },
  {
    id: 'hist-3',
    createdAt: '2026-10-07T16:30:00.000Z',
    vehicleType: 'police',
    emergencyPriority: 'high',
    incidentType: 'accident',
    origin: { address: 'Cyberabad Police Station', lat: 17.4375, lng: 78.3610 },
    destination: { address: 'ORR Junction 4', lat: 17.4812, lng: 78.3140 },
    recommendedRouteName: 'Route A',
    etaMinutes: 8,
    distanceMeters: 5100,
    overallScore: 88,
    trafficLevel: 'moderate',
    riskLevel: 'medium',
    aiSummary: 'Direct express route prioritized for interceptor speed.',
    confidenceScore: 88,
    routesCount: 3,
  },
];

export const HistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [history, setHistory] = useState<HistoryItem[]>(DEMO_HISTORY);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    historyApi
      .getHistory({
        search: search || undefined,
        vehicleType: vehicleFilter || undefined,
        emergencyPriority: priorityFilter || undefined,
      })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setHistory(res.data);
        }
      })
      .catch((err) => console.warn('Using local demo history:', err));
  }, [vehicleFilter, priorityFilter]);

  const filteredHistory = history.filter((item) => {
    if (vehicleFilter && item.vehicleType !== vehicleFilter) return false;
    if (priorityFilter && item.emergencyPriority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.origin.address.toLowerCase().includes(q) ||
        item.destination.address.toLowerCase().includes(q) ||
        item.recommendedRouteName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Subheading (Section 27) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE5E9]">
        <div>
          <h1 className="text-2xl font-black text-[#112B37]">Route History</h1>
          <p className="text-xs sm:text-sm text-[#617580] mt-0.5">
            Review previously analyzed emergency routes.
          </p>
        </div>
      </div>

      {/* Filters (Section 27: Date, Vehicle, Priority, Status) */}
      <Card className="p-4 bg-white border border-[#DCE5E9] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <Input
              placeholder="Search origin, destination, or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#617580]" />}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              options={[
                { value: '', label: 'All Vehicles' },
                { value: 'ambulance', label: 'Ambulance' },
                { value: 'fire_engine', label: 'Fire Engine' },
                { value: 'police', label: 'Police Vehicle' },
                { value: 'rescue', label: 'Rescue Vehicle' },
              ]}
            />
          </div>

          <div className="sm:col-span-4">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* History Table (Section 27) */}
      <Card className="bg-white border border-[#DCE5E9] shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F5F6] border-b border-[#DCE5E9] text-[#617580] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Vehicle</th>
                <th className="px-5 py-3.5">Emergency</th>
                <th className="px-5 py-3.5">Origin</th>
                <th className="px-5 py-3.5">Destination</th>
                <th className="px-5 py-3.5">Recommended Route</th>
                <th className="px-5 py-3.5">ETA</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5E9] text-[#112B37]">
              {filteredHistory.map((item) => {
                const priorityStyle = getPriorityColor(item.emergencyPriority);
                return (
                  <tr key={item.id} className="hover:bg-[#F2F5F6]/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-[#617580] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold capitalize whitespace-nowrap">
                      {item.vehicleType.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                      >
                        {item.emergencyPriority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#112B37] max-w-xs truncate">
                      {item.origin.address}
                    </td>
                    <td className="px-5 py-4 font-medium text-[#112B37] max-w-xs truncate">
                      {item.destination.address}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#007F86] whitespace-nowrap">
                      {item.recommendedRouteName}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#112B37] whitespace-nowrap">
                      {item.etaMinutes} min
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F5ED] text-[#24735B]">
                        Completed
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-[#007F86] hover:text-[#006B70] font-semibold text-xs p-1"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Section 27: On mobile, transform rows into cards) */}
        <div className="md:hidden divide-y divide-[#DCE5E9]">
          {filteredHistory.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#617580] font-medium">
                  {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FCECEE] text-[#C73540]">
                  {item.emergencyPriority.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-[#112B37]">
                  {item.origin.address} → {item.destination.address}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#617580]">
                  <span>Vehicle: <strong className="text-[#112B37] capitalize">{item.vehicleType}</strong></span>
                  <span>ETA: <strong className="text-[#007F86]">{item.etaMinutes} min</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DCE5E9]">
                <span className="text-xs font-bold text-[#007F86]">
                  {item.recommendedRouteName}
                </span>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-bold text-[#007F86] hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Emergency Dispatch Record"
          subtitle={`Logged on ${new Date(selectedItem.createdAt).toLocaleString()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#F2F5F6] rounded-lg space-y-1.5">
              <p><strong className="text-[#617580]">Origin:</strong> {selectedItem.origin.address}</p>
              <p><strong className="text-[#617580]">Destination:</strong> {selectedItem.destination.address}</p>
              <p><strong className="text-[#617580]">Vehicle Class:</strong> <span className="capitalize">{selectedItem.vehicleType}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#E1F2F1] rounded-lg">
                <span className="text-[#617580] block text-[11px]">Recommended Route</span>
                <span className="font-bold text-[#007F86] text-sm">{selectedItem.recommendedRouteName}</span>
              </div>
              <div className="p-2.5 bg-[#E8F5ED] rounded-lg">
                <span className="text-[#617580] block text-[11px]">Estimated Arrival</span>
                <span className="font-bold text-[#24735B] text-sm">{selectedItem.etaMinutes} min</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#DCE5E9] rounded-lg">
              <p className="font-semibold text-[#112B37]">AI Rationale Summary</p>
              <p className="text-[#617580] mt-1 leading-relaxed">{selectedItem.aiSummary}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
