import { DeterministicScoringEngine } from '../services/scoring/deterministicScoring';

describe('DeterministicScoringEngine', () => {
  it('should calculate higher reliability and emergency scores for routes with no traffic delays', () => {
    const result = DeterministicScoringEngine.calculateScores({
      routeIndex: 0,
      distanceMeters: 5000,
      durationSeconds: 300,
      trafficDurationSeconds: 300,
      vehicleType: 'ambulance',
      emergencyPriority: 'critical',
      events: [],
    });

    expect(result.trafficLevel).toBe('low');
    expect(result.predictedDelaySeconds).toBe(0);
    expect(result.reliabilityScore).toBeGreaterThanOrEqual(90);
    expect(result.emergencyScore).toBeGreaterThanOrEqual(70);
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.riskLevel).toBe('low');
  });

  it('should penalize congested routes and assign severe traffic level', () => {
    const result = DeterministicScoringEngine.calculateScores({
      routeIndex: 1,
      distanceMeters: 5000,
      durationSeconds: 300,
      trafficDurationSeconds: 600, // 100% delay
      vehicleType: 'ambulance',
      emergencyPriority: 'critical',
      events: [],
    });

    expect(result.trafficLevel).toBe('severe');
    expect(result.predictedDelaySeconds).toBe(300);
    expect(result.reliabilityScore).toBeLessThan(80);
  });

  it('should apply higher traffic penalty to fire engines due to apparatus size', () => {
    const ambulanceResult = DeterministicScoringEngine.calculateScores({
      routeIndex: 0,
      distanceMeters: 5000,
      durationSeconds: 300,
      trafficDurationSeconds: 450,
      vehicleType: 'ambulance',
      emergencyPriority: 'critical',
    });

    const fireEngineResult = DeterministicScoringEngine.calculateScores({
      routeIndex: 0,
      distanceMeters: 5000,
      durationSeconds: 300,
      trafficDurationSeconds: 450,
      vehicleType: 'fire_engine',
      emergencyPriority: 'critical',
    });

    // Fire engine should have a lower reliability due to heavy apparatus penalty
    expect(fireEngineResult.reliabilityScore).toBeLessThanOrEqual(ambulanceResult.reliabilityScore);
    expect(fireEngineResult.warnings.length).toBeGreaterThan(0);
  });
});
