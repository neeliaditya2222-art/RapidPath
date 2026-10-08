import {
  VehicleType,
  EmergencyPriority,
  TrafficLevel,
  RiskLevel,
  RouteEvent,
  RouteSegment,
} from '../../types';
import { config } from '../../config';

export interface ScoringInput {
  routeIndex: number;
  distanceMeters: number;
  durationSeconds: number;
  trafficDurationSeconds: number;
  vehicleType: VehicleType;
  emergencyPriority: EmergencyPriority;
  events?: RouteEvent[];
  segments?: RouteSegment[];
}

export interface RouteScoreResult {
  trafficLevel: TrafficLevel;
  predictedDelaySeconds: number;
  riskLevel: RiskLevel;
  reliabilityScore: number;
  emergencyScore: number;
  overallScore: number;
  warnings: string[];
}

export class DeterministicScoringEngine {
  /**
   * Evaluates deterministic scores for a route based on physics, vehicle profile, traffic and incidents.
   */
  public static calculateScores(input: ScoringInput): RouteScoreResult {
    const {
      distanceMeters,
      durationSeconds,
      trafficDurationSeconds,
      vehicleType,
      emergencyPriority,
      events = [],
      segments = [],
    } = input;

    const vehicleProfile = config.vehicleProfiles[vehicleType] || config.vehicleProfiles.other;
    const priorityWeight = config.priorityWeights[emergencyPriority] || config.priorityWeights.critical;

    // 1. Calculate Traffic Delay & Level
    const baseDuration = Math.max(1, durationSeconds);
    const trafficDuration = Math.max(baseDuration, trafficDurationSeconds);
    const delayRatio = (trafficDuration - baseDuration) / baseDuration;
    const predictedDelaySeconds = Math.max(0, trafficDuration - baseDuration);

    let trafficLevel: TrafficLevel = 'low';
    if (delayRatio > 0.6) {
      trafficLevel = 'severe';
    } else if (delayRatio > 0.3) {
      trafficLevel = 'heavy';
    } else if (delayRatio > 0.1) {
      trafficLevel = 'moderate';
    }

    // 2. Incident & Event Risk Assessment
    const warnings: string[] = [];
    let eventPenalty = 0;

    for (const event of events) {
      if (event.severity === 'high') {
        eventPenalty += 25;
        warnings.push(`High severity disruption: ${event.description}`);
      } else if (event.severity === 'medium') {
        eventPenalty += 12;
        warnings.push(`Moderate hazard: ${event.description}`);
      } else {
        eventPenalty += 5;
      }
    }

    // Heavy vehicle constraints penalty (e.g. fire engine on narrow/tight segments)
    if (vehicleType === 'fire_engine' && delayRatio > 0.25) {
      eventPenalty += 10;
      warnings.push('Narrow corridor congestion hazard for heavy apparatus');
    }

    // 3. Reliability Score (0 to 100)
    // Higher variance in traffic or events lowers reliability
    const trafficVariancePenalty = delayRatio * 45 * vehicleProfile.trafficPenaltyWeight;
    const reliabilityScore = Math.max(
      15,
      Math.min(100, Math.round(100 - trafficVariancePenalty - eventPenalty * 0.7))
    );

    // 4. Emergency Suitability Score (0 to 100)
    // Speed factor, adjusted duration, traffic avoidance
    const effectiveTravelDuration = trafficDuration / vehicleProfile.speedFactor;
    // Normalize travel speed (km/h)
    const speedKmh = (distanceMeters / 1000) / (effectiveTravelDuration / 3600);
    
    let speedRating = Math.min(100, (speedKmh / 60) * 100);
    if (speedRating < 20) speedRating = 20;

    const trafficDeduction = (delayRatio * 50) * vehicleProfile.trafficPenaltyWeight;
    const emergencyScore = Math.max(
      10,
      Math.min(100, Math.round(speedRating * 0.5 + (100 - trafficDeduction) * 0.3 + (100 - eventPenalty) * 0.2))
    );

    // 5. Risk Level
    let riskLevel: RiskLevel = 'low';
    const totalRiskIndex = (100 - reliabilityScore) * 0.6 + eventPenalty * 0.4;
    if (totalRiskIndex > 65) {
      riskLevel = 'critical';
    } else if (totalRiskIndex > 45) {
      riskLevel = 'high';
    } else if (totalRiskIndex > 25) {
      riskLevel = 'medium';
    }

    // 6. Overall Composite Score (0 to 100)
    // Weighted combination of time, traffic, risk, and reliability based on priority
    const timeScore = Math.max(10, Math.min(100, 100 - (trafficDuration / 120))); // Relative duration utility
    const trafficScore = Math.max(10, Math.min(100, 100 - (delayRatio * 100)));
    const riskScore = Math.max(10, Math.min(100, 100 - totalRiskIndex));

    const overallScore = Math.max(
      10,
      Math.min(
        99.5,
        parseFloat(
          (
            timeScore * priorityWeight.timeWeight +
            trafficScore * priorityWeight.trafficWeight +
            riskScore * priorityWeight.riskWeight +
            reliabilityScore * priorityWeight.reliabilityWeight
          ).toFixed(1)
        )
      )
    );

    return {
      trafficLevel,
      predictedDelaySeconds,
      riskLevel,
      reliabilityScore,
      emergencyScore,
      overallScore,
      warnings,
    };
  }
}
