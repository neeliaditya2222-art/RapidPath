import { z } from 'zod';

export const aiRouteAnalysisSingleSchema = z.object({
  routeIndex: z.number().int().min(0),
  trafficAssessment: z.enum(['low', 'moderate', 'heavy', 'severe']).default('moderate'),
  delayRisk: z.enum(['low', 'medium', 'high']).default('medium'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  reliabilityScore: z.number().min(0).max(100),
  emergencySuitabilityScore: z.number().min(0).max(100),
  reasoning: z.string().min(5),
  riskFactors: z.array(z.string()).default([]),
});

export const aiRouteAnalysisResponseSchema = z.object({
  recommendedRouteIndex: z.number().int().min(0),
  confidenceScore: z.number().min(0).max(100),
  summary: z.string().min(5),
  routeAnalyses: z.array(aiRouteAnalysisSingleSchema).min(1),
  recommendations: z.array(z.string()).default([]),
});

export const aiDelayPredictionSchema = z.object({
  delayRisk: z.enum(['low', 'medium', 'high']),
  predictedAdditionalDelaySeconds: z.number().min(0),
  confidenceScore: z.number().min(0).max(100),
  factors: z.array(z.string()),
});

export const aiRouteExplanationSchema = z.object({
  explanation: z.string().min(5),
  keyReasons: z.array(z.string()).min(1),
});

export type AIRouteAnalysisResponse = z.infer<typeof aiRouteAnalysisResponseSchema>;
export type AIDelayPrediction = z.infer<typeof aiDelayPredictionSchema>;
export type AIRouteExplanation = z.infer<typeof aiRouteExplanationSchema>;
