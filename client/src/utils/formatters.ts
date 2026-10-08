import { TrafficLevel, RiskLevel, VehicleType, EmergencyPriority } from '../types';

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSecs < 60) return 'Just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Status Colors matching Section 6
export function getTrafficBadgeColor(level: TrafficLevel): { bg: string; text: string; border: string } {
  switch (level) {
    case 'low':
      return { bg: 'bg-[#E8F5ED]', text: 'text-[#24735B]', border: 'border-[#24735B]/20' };
    case 'moderate':
      return { bg: 'bg-[#FFF2D7]', text: 'text-[#97610A]', border: 'border-[#97610A]/20' };
    case 'heavy':
    case 'severe':
      return { bg: 'bg-[#FCECEE]', text: 'text-[#C73540]', border: 'border-[#C73540]/20' };
    default:
      return { bg: 'bg-[#F2F5F6]', text: 'text-[#617580]', border: 'border-[#DCE5E9]' };
  }
}

export function getRiskBadgeColor(level: RiskLevel): { bg: string; text: string; border: string } {
  switch (level) {
    case 'low':
      return { bg: 'bg-[#E8F5ED]', text: 'text-[#24735B]', border: 'border-[#24735B]/20' };
    case 'medium':
      return { bg: 'bg-[#FFF2D7]', text: 'text-[#97610A]', border: 'border-[#97610A]/20' };
    case 'high':
    case 'critical':
      return { bg: 'bg-[#FCECEE]', text: 'text-[#C73540]', border: 'border-[#C73540]/20' };
    default:
      return { bg: 'bg-[#F2F5F6]', text: 'text-[#617580]', border: 'border-[#DCE5E9]' };
  }
}

export function getPriorityColor(priority: EmergencyPriority): { bg: string; text: string; border: string } {
  switch (priority) {
    case 'critical':
      return { bg: 'bg-[#FCECEE]', text: 'text-[#C73540]', border: 'border-[#C73540]/30' };
    case 'high':
      return { bg: 'bg-[#FFF2D7]', text: 'text-[#97610A]', border: 'border-[#97610A]/30' };
    case 'medium':
      return { bg: 'bg-[#FFF2D7]', text: 'text-[#97610A]', border: 'border-[#97610A]/20' };
    case 'low':
      return { bg: 'bg-[#E8F5ED]', text: 'text-[#24735B]', border: 'border-[#24735B]/30' };
  }
}

export function getRouteColor(index: number, isRecommended: boolean): string {
  if (isRecommended) return '#007F86'; // Teal for recommended active route
  if (index === 0) return '#617580'; // Slate muted alternative
  if (index === 1) return '#007F86'; // Teal
  return '#8395A0'; // Light slate alternative
}
