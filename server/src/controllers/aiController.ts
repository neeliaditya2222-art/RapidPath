import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini/geminiClient';
import { ValidationError } from '../utils/errors';
import { z } from 'zod';

const customAnalyzeSchema = z.object({
  emergencyContext: z.object({
    vehicleType: z.enum(['ambulance', 'fire_engine', 'police', 'rescue', 'other']),
    emergencyPriority: z.enum(['critical', 'high', 'medium', 'low']),
    incidentType: z.string().optional(),
    notes: z.string().optional(),
    originAddress: z.string().min(2),
    destinationAddress: z.string().min(2),
  }),
  routes: z.array(z.any()).min(1),
});

export class AIController {
  /**
   * POST /api/ai/analyze-routes
   * Internal / Admin inspection endpoint
   */
  public async analyzeRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = customAnalyzeSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid AI analysis request payload', validation.error.format());
      }

      const { emergencyContext, routes } = validation.data;
      const result = await geminiService.analyzeRoutes(emergencyContext as any, routes);

      res.status(200).json({
        success: true,
        data: result.analysis,
        isFallback: result.isFallback,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
