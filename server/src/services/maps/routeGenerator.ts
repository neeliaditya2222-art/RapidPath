import { LocationPoint, NormalizedRoute, RouteSegment, RouteEvent, VehicleType, EmergencyPriority } from '../../types';
import { calculateHaversineDistance } from '../../utils/geo';
import { encodePolyline } from '../../utils/polyline';
import { DeterministicScoringEngine } from '../scoring/deterministicScoring';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates realistic geospatial routes with distinct corridors, steps, turn-by-turns, and traffic profiles.
 * Used when Google Maps API key is in simulation mode or as a failover.
 */
export class RouteGenerator {
  public static generateSimulatedRoutes(
    origin: LocationPoint,
    destination: LocationPoint,
    vehicleType: VehicleType,
    emergencyPriority: EmergencyPriority,
    incidentType?: string
  ): NormalizedRoute[] {
    const directDistance = calculateHaversineDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );

    // Calculate base metrics
    // Realistic city driving speed ~ 35 - 50 km/h (9.7 - 13.8 m/s)
    const baseSpeedMs = 12.5; 

    // Route 1: Express Highway / Primary Arterial (Fastest & direct, moderate traffic)
    const route1 = this.createCorridor({
      index: 0,
      name: 'Express Arterial Corridor (Hwy 101/Main Ave)',
      summary: 'Direct primary arterial with synchronized emergency green-wave lights',
      origin,
      destination,
      distanceMultiplier: 1.05,
      trafficFactor: 1.15,
      curvatureOffset: 0.003,
      vehicleType,
      emergencyPriority,
      roadNames: ['Emergency Express Blvd', 'Metro Flyover', 'Central Medical Corridor'],
      disruptions: [
        {
          eventType: 'slow_traffic',
          severity: 'low',
          description: 'Moderate vehicle volume near intersection 12',
          offsetFraction: 0.45,
        },
      ],
    });

    // Route 2: Northern Ring Road / Bypass (Longer distance, low traffic, high reliability)
    const route2 = this.createCorridor({
      index: 1,
      name: 'North Ring Bypass',
      summary: 'Circumferential bypass avoiding city core and commercial congestion',
      origin,
      destination,
      distanceMultiplier: 1.22,
      trafficFactor: 1.04, // Very light traffic
      curvatureOffset: 0.012,
      vehicleType,
      emergencyPriority,
      roadNames: ['Outer Perimeter Way', 'Northwest Freeway', 'Hospital Spur Rd'],
      disruptions: [],
    });

    // Route 3: Downtown Surface Grid (Shortest distance, but higher congestion risk)
    const route3 = this.createCorridor({
      index: 2,
      name: 'City Central Grid (Cross-Town)',
      summary: 'Shortest geographic path via urban grid, but subject to peak-hour slowdowns',
      origin,
      destination,
      distanceMultiplier: 0.98,
      trafficFactor: 1.55, // Heavy downtown traffic
      curvatureOffset: -0.007,
      vehicleType,
      emergencyPriority,
      roadNames: ['Market Street', '5th Avenue', 'Pine Blvd', 'Clinical Way'],
      disruptions: [
        {
          eventType: 'construction',
          severity: 'medium',
          description: 'Utility maintenance closing right lane',
          offsetFraction: 0.6,
        },
      ],
    });

    const routes = [route1, route2, route3];

    // Mark the one with highest overallScore as recommended
    let bestIdx = 0;
    let maxScore = -1;
    routes.forEach((r, i) => {
      if (r.overallScore > maxScore) {
        maxScore = r.overallScore;
        bestIdx = i;
      }
    });

    routes.forEach((r, i) => {
      r.isRecommended = i === bestIdx;
    });

    return routes;
  }

  private static createCorridor(options: {
    index: number;
    name: string;
    summary: string;
    origin: LocationPoint;
    destination: LocationPoint;
    distanceMultiplier: number;
    trafficFactor: number;
    curvatureOffset: number;
    vehicleType: VehicleType;
    emergencyPriority: EmergencyPriority;
    roadNames: string[];
    disruptions: { eventType: string; severity: 'low' | 'medium' | 'high'; description: string; offsetFraction: number }[];
  }): NormalizedRoute {
    const {
      index,
      name,
      summary,
      origin,
      destination,
      distanceMultiplier,
      trafficFactor,
      curvatureOffset,
      vehicleType,
      emergencyPriority,
      roadNames,
      disruptions,
    } = options;

    const straightDist = calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const distanceMeters = Math.round(straightDist * distanceMultiplier);
    
    // Normal base speed in m/s
    const baseDurationSeconds = Math.round(distanceMeters / 12.0);
    const trafficDurationSeconds = Math.round(baseDurationSeconds * trafficFactor);

    // Generate smooth polyline coordinates
    const stepsCount = 14;
    const path: [number, number][] = [];
    const segments: RouteSegment[] = [];

    const dLat = destination.lat - origin.lat;
    const dLng = destination.lng - origin.lng;

    for (let i = 0; i <= stepsCount; i++) {
      const frac = i / stepsCount;
      // Parabolic curve offset
      const arc = Math.sin(frac * Math.PI) * curvatureOffset;
      const lat = origin.lat + dLat * frac + arc * (index % 2 === 0 ? 1 : -1);
      const lng = origin.lng + dLng * frac + arc * (index === 1 ? 1 : -0.8);
      path.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }

    // Generate segment breakdown
    const segCount = Math.min(path.length - 1, roadNames.length);
    const segDist = Math.round(distanceMeters / segCount);
    const segDur = Math.round(trafficDurationSeconds / segCount);

    for (let i = 0; i < segCount; i++) {
      const segStart = { lat: path[i * 2][0], lng: path[i * 2][1] };
      const nextIdx = Math.min(path.length - 1, (i + 1) * 2);
      const segEnd = { lat: path[nextIdx][0], lng: path[nextIdx][1] };
      const roadName = roadNames[i] || `Segment Corridor ${i + 1}`;

      segments.push({
        start: segStart,
        end: segEnd,
        distanceMeters: segDist,
        durationSeconds: segDur,
        trafficLevel: trafficFactor > 1.3 ? 'heavy' : trafficFactor > 1.1 ? 'moderate' : 'low',
        roadName,
        instruction: i === 0 ? `Depart origin onto ${roadName}` : i === segCount - 1 ? `Arrive at destination via ${roadName}` : `Continue on ${roadName} for ${(segDist / 1000).toFixed(1)} km`,
      });
    }

    // Attach events/disruptions
    const events: RouteEvent[] = disruptions.map((d, dIdx) => {
      const idx = Math.floor(path.length * d.offsetFraction);
      const pt = path[idx] || path[0];
      return {
        id: uuidv4(),
        eventType: d.eventType,
        severity: d.severity,
        description: d.description,
        lat: pt[0],
        lng: pt[1],
        source: 'dispatch-telemetry-feed',
      };
    });

    const encodedPolyline = encodePolyline(path);

    // Calculate deterministic scores
    const scoreResult = DeterministicScoringEngine.calculateScores({
      routeIndex: index,
      distanceMeters,
      durationSeconds: baseDurationSeconds,
      trafficDurationSeconds,
      vehicleType,
      emergencyPriority,
      events,
      segments,
    });

    return {
      id: uuidv4(),
      routeIndex: index,
      name,
      summary,
      distanceMeters,
      durationSeconds: baseDurationSeconds,
      trafficDurationSeconds,
      trafficLevel: scoreResult.trafficLevel,
      predictedDelaySeconds: scoreResult.predictedDelaySeconds,
      riskLevel: scoreResult.riskLevel,
      reliabilityScore: scoreResult.reliabilityScore,
      emergencyScore: scoreResult.emergencyScore,
      overallScore: scoreResult.overallScore,
      encodedPolyline,
      path,
      segments,
      events,
      warnings: scoreResult.warnings,
      isRecommended: false,
    };
  }
}
