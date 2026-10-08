export type VehicleType = 'ambulance' | 'fire_engine' | 'police' | 'rescue' | 'other';

export type EmergencyPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentType =
  | 'medical'
  | 'accident'
  | 'fire'
  | 'crime'
  | 'natural_disaster'
  | 'rescue'
  | 'other';

export type TrafficLevel = 'low' | 'moderate' | 'heavy' | 'severe';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface NearbyHospital {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters: number;
  estimatedDurationMinutes: number;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
}

export interface RouteEvent {
  id: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  lat: number;
  lng: number;
  source: string;
  timestamp?: string;
}

export interface RouteSegment {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  trafficLevel: TrafficLevel;
  roadName: string;
  instruction: string;
}

export interface NormalizedRoute {
  id: string;
  routeIndex: number;
  name: string;
  summary: string;
  distanceMeters: number;
  durationSeconds: number;
  trafficDurationSeconds: number;
  trafficLevel: TrafficLevel;
  predictedDelaySeconds: number;
  riskLevel: RiskLevel;
  reliabilityScore: number;
  emergencyScore: number;
  overallScore: number;
  encodedPolyline: string;
  path: [number, number][]; // [lat, lng] array
  segments: RouteSegment[];
  events: RouteEvent[];
  warnings: string[];
  isRecommended: boolean;
}

export interface GeminiRouteSingleAnalysis {
  routeIndex: number;
  trafficAssessment: TrafficLevel;
  delayRisk: 'low' | 'medium' | 'high';
  riskLevel: RiskLevel;
  reliabilityScore: number;
  emergencySuitabilityScore: number;
  reasoning: string;
  riskFactors: string[];
}

export interface GeminiRouteAnalysis {
  recommendedRouteIndex: number;
  confidenceScore: number;
  summary: string;
  routeAnalyses: GeminiRouteSingleAnalysis[];
  recommendations: string[];
  modelName?: string;
}

export interface RouteRequestPayload {
  origin: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  emergencyPriority: EmergencyPriority;
  incidentType?: IncidentType;
  notes?: string;
  userId?: string;
}

export interface RouteAnalysisResult {
  success: boolean;
  requestId: string;
  recommendedRouteId: string;
  recommendedRouteIndex: number;
  origin: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  emergencyPriority: EmergencyPriority;
  incidentType?: IncidentType;
  notes?: string;
  routes: NormalizedRoute[];
  aiAnalysis: GeminiRouteAnalysis | null;
  isAiFallback: boolean;
  createdAt: string;
}

export interface AppSettings {
  id?: string;
  userId: string;
  refreshIntervalSeconds: number;
  defaultVehicleType: VehicleType;
  defaultEmergencyPriority: EmergencyPriority;
  mapTheme: 'dark' | 'light' | 'tactical' | 'satellite';
  autoRerouteOnCongestion: boolean;
  soundAlertsEnabled: boolean;
  simulationMode: boolean;
  geminiModel: string;
  updatedAt: string;
}
