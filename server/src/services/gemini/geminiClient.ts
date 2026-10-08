import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import {
  aiRouteAnalysisResponseSchema,
  AIRouteAnalysisResponse,
} from '../../validators/aiResponse.validator';
import { SYSTEM_PROMPT, buildRouteComparisonPrompt } from './promptTemplates';
import { NormalizedRoute, VehicleType, EmergencyPriority } from '../../types';

export class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor() {
    this.modelName = config.gemini.model || 'gemini-1.5-flash';
    if (config.gemini.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    }
  }

  /**
   * Evaluates all routes using Gemini AI with fallback to deterministic heuristics
   */
  public async analyzeRoutes(
    emergencyContext: {
      vehicleType: VehicleType;
      emergencyPriority: EmergencyPriority;
      incidentType?: string;
      notes?: string;
      originAddress: string;
      destinationAddress: string;
    },
    routes: NormalizedRoute[]
  ): Promise<{ analysis: AIRouteAnalysisResponse; isFallback: boolean }> {
    // If no API key configured, use deterministic AI synthesis
    if (!this.genAI || !config.gemini.apiKey) {
      logger.info('Gemini API key not configured or empty. Using deterministic AI synthesis.');
      return {
        analysis: this.generateDeterministicAIAnalysis(emergencyContext, routes),
        isFallback: true,
      };
    }

    const promptText = buildRouteComparisonPrompt(emergencyContext, routes);

    for (let attempt = 1; attempt <= config.gemini.maxRetries + 1; attempt++) {
      try {
        logger.info(`Sending route analysis to Gemini AI (Model: ${this.modelName}, Attempt: ${attempt})`);

        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.1, // Low temperature for deterministic, consistent reasoning
            responseMimeType: 'application/json',
          },
        });

        // Add timeout protection
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out')), config.gemini.timeoutMs)
        );

        const geminiCall = model.generateContent(promptText);
        const result = (await Promise.race([geminiCall, timeoutPromise])) as any;
        const responseText = result.response.text();

        // Parse and validate JSON
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(responseText);
        } catch (e) {
          // If returned with markdown wrappers
          const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedJson = JSON.parse(cleaned);
        }

        const validation = aiRouteAnalysisResponseSchema.safeParse(parsedJson);

        if (!validation.success) {
          logger.warn('Gemini response failed Zod schema validation:', {
            errors: validation.error.format(),
          });
          throw new Error('Invalid JSON structure from Gemini');
        }

        logger.info('Gemini route analysis successfully validated');
        return {
          analysis: validation.data,
          isFallback: false,
        };
      } catch (error: any) {
        logger.error(`Gemini evaluation attempt ${attempt} failed: ${error?.message || error}`);
        if (attempt <= config.gemini.maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 500;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    // Graceful fallback if all attempts fail
    logger.warn('Falling back to deterministic AI analysis synthesis due to Gemini error');
    return {
      analysis: this.generateDeterministicAIAnalysis(emergencyContext, routes),
      isFallback: true,
    };
  }

  /**
   * Deterministic AI reasoning synthesis when Gemini API is unavailable or rate-limited
   */
  public generateDeterministicAIAnalysis(
    context: {
      vehicleType: VehicleType;
      emergencyPriority: EmergencyPriority;
      incidentType?: string;
      notes?: string;
    },
    routes: NormalizedRoute[]
  ): AIRouteAnalysisResponse {
    if (!routes.length) {
      return {
        recommendedRouteIndex: 0,
        confidenceScore: 75,
        summary: 'No route options available to analyze.',
        routeAnalyses: [],
        recommendations: ['Check origin and destination inputs.'],
      };
    }

    // Rank routes by overallScore
    let bestIndex = 0;
    let highestScore = -1;

    const routeAnalyses = routes.map((route, idx) => {
      if (route.overallScore > highestScore) {
        highestScore = route.overallScore;
        bestIndex = idx;
      }

      const trafficAssessment = route.trafficLevel;
      const delayRisk: 'low' | 'medium' | 'high' =
        route.predictedDelaySeconds > 300 ? 'high' : route.predictedDelaySeconds > 120 ? 'medium' : 'low';
      
      const riskFactors: string[] = [];
      if (route.trafficLevel === 'heavy' || route.trafficLevel === 'severe') {
        riskFactors.push(`High traffic congestion detected (+${Math.round(route.predictedDelaySeconds / 60)} min delay)`);
      }
      if (route.warnings.length > 0) {
        riskFactors.push(...route.warnings);
      }
      if (route.riskLevel === 'high' || route.riskLevel === 'critical') {
        riskFactors.push('Elevated hazard rating based on road disruptions');
      }

      const reasoning =
        route.overallScore >= 80
          ? `Optimal arterial corridor with high reliability (${route.reliabilityScore}%) and minimal predicted delay.`
          : route.trafficLevel === 'severe'
          ? `Heavily congested corridor with severe bottlenecks causing approx ${Math.round(route.predictedDelaySeconds / 60)} min delay.`
          : `Viable secondary option with moderate traffic flow and acceptable emergency response profile.`;

      return {
        routeIndex: idx,
        trafficAssessment,
        delayRisk,
        riskLevel: route.riskLevel,
        reliabilityScore: route.reliabilityScore,
        emergencySuitabilityScore: route.emergencyScore,
        reasoning,
        riskFactors,
      };
    });

    const recommendedRoute = routes[bestIndex];
    const diffMins = Math.round(recommendedRoute.predictedDelaySeconds / 60);
    const summary = `${recommendedRoute.name} is prioritized for ${context.vehicleType} response. It maintains the highest emergency suitability score (${recommendedRoute.emergencyScore}/100) with ${recommendedRoute.reliabilityScore}% reliability and estimated travel duration of ${Math.round(recommendedRoute.durationSeconds / 60)} min.`;

    const recommendations = [
      `Dispatch ${context.vehicleType.toUpperCase()} along ${recommendedRoute.name}`,
      recommendedRoute.trafficLevel === 'low'
        ? 'Route traffic is clear; maintain standard emergency siren protocol'
        : 'Prepare for local bottleneck clearance near major intersections',
      `Monitor real-time updates for priority level [${context.emergencyPriority.toUpperCase()}]`,
    ];

    return {
      recommendedRouteIndex: bestIndex,
      confidenceScore: 88,
      summary,
      routeAnalyses,
      recommendations,
    };
  }
}

export const geminiService = new GeminiAIService();
