import { routeRequestSchema, historyQuerySchema } from '../validators/routeRequest.validator';
import { aiRouteAnalysisResponseSchema } from '../validators/aiResponse.validator';

describe('Zod Schema Validators', () => {
  describe('routeRequestSchema', () => {
    it('should validate valid route request payload', () => {
      const payload = {
        origin: { address: '123 Main St, City', lat: 37.7749, lng: -122.4194 },
        destination: { address: '456 Hospital Ave, City', lat: 37.7849, lng: -122.4094 },
        vehicleType: 'ambulance',
        emergencyPriority: 'critical',
        incidentType: 'medical',
        notes: 'Cardiac arrest en route',
      };

      const result = routeRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      const invalidPayload = {
        origin: { address: 'A', lat: 95.0, lng: -122.4194 }, // lat > 90
        destination: { address: 'B', lat: 37.7849, lng: -190.0 }, // lng < -180
        vehicleType: 'ambulance',
        emergencyPriority: 'critical',
      };

      const result = routeRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid vehicleType enum', () => {
      const invalidPayload = {
        origin: { address: 'Main St', lat: 37.7749, lng: -122.4194 },
        destination: { address: 'Hospital Ave', lat: 37.7849, lng: -122.4094 },
        vehicleType: 'unicycle', // invalid
        emergencyPriority: 'critical',
      };

      const result = routeRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('aiRouteAnalysisResponseSchema', () => {
    it('should validate complete Gemini AI response payload', () => {
      const aiResponse = {
        recommendedRouteIndex: 0,
        confidenceScore: 92,
        summary: 'Route 1 provides the lowest congestion risk and safest arterial pathway.',
        routeAnalyses: [
          {
            routeIndex: 0,
            trafficAssessment: 'low',
            delayRisk: 'low',
            riskLevel: 'low',
            reliabilityScore: 90,
            emergencySuitabilityScore: 95,
            reasoning: 'Clear passage with signal priority',
            riskFactors: [],
          },
        ],
        recommendations: ['Dispatch immediately along Route 1'],
      };

      const result = aiRouteAnalysisResponseSchema.safeParse(aiResponse);
      expect(result.success).toBe(true);
    });
  });
});
