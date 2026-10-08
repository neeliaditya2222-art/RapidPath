import { Request, Response, NextFunction } from 'express';
import { routeRequestSchema, historyQuerySchema } from '../validators/routeRequest.validator';
import { routeOrchestrator } from '../services/routing/routeOrchestrator';
import { RouteRequestModel } from '../models/RouteRequest';
import { RouteModel } from '../models/Route';
import { AIAnalysisModel } from '../models/AIAnalysis';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export class RoutesController {
  /**
   * POST /api/routes/analyze
   */
  public async analyzeRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = routeRequestSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid route request parameters', validation.error.format());
      }

      const userId = (req as any).user?.id || 'operator-default';
      const result = await routeOrchestrator.analyzeEmergencyRoute({
        ...validation.data,
        userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/routes/:requestId/refresh
   */
  public async refreshRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
      const userId = (req as any).user?.id || 'operator-default';

      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ValidationError('Invalid request ID format');
      }

      let routeReq: any = null;
      if (mongoose.connection.readyState === 1) {
        routeReq = await RouteRequestModel.findOne({
          _id: requestId,
          userId, // Row-level data isolation
        });
      }

      if (!routeReq) {
        // If not in DB or in mock session, use body if provided
        if (req.body && req.body.origin && req.body.destination) {
          const freshResult = await routeOrchestrator.analyzeEmergencyRoute(
            { ...req.body, userId },
            true // bypass cache to force fresh update
          );
          res.status(200).json(freshResult);
          return;
        }
        throw new NotFoundError('Emergency route request');
      }

      const freshResult = await routeOrchestrator.analyzeEmergencyRoute(
        {
          origin: { address: routeReq.originText, lat: routeReq.originLat, lng: routeReq.originLng },
          destination: { address: routeReq.destinationText, lat: routeReq.destinationLat, lng: routeReq.destinationLng },
          vehicleType: routeReq.vehicleType,
          emergencyPriority: routeReq.emergencyPriority,
          incidentType: routeReq.incidentType,
          notes: routeReq.notes,
          userId,
        },
        true // bypass cache
      );

      res.status(200).json(freshResult);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/routes/:requestId
   */
  public async getRouteDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
      const userId = (req as any).user?.id || 'operator-default';

      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ValidationError('Invalid request ID format');
      }

      if (mongoose.connection.readyState !== 1) {
        throw new NotFoundError('Database connection unavailable');
      }

      const routeReq = await RouteRequestModel.findOne({
        _id: requestId,
        userId, // strict user scoping
      });

      if (!routeReq) {
        throw new NotFoundError('Route request');
      }

      const routes = await RouteModel.find({ requestId: routeReq._id }).sort({ routeIndex: 1 });
      const aiAnalysis = await AIAnalysisModel.findOne({ requestId: routeReq._id });

      res.status(200).json({
        success: true,
        requestId: routeReq._id.toString(),
        recommendedRouteId: routeReq.recommendedRouteId,
        origin: {
          address: routeReq.originText,
          lat: routeReq.originLat,
          lng: routeReq.originLng,
        },
        destination: {
          address: routeReq.destinationText,
          lat: routeReq.destinationLat,
          lng: routeReq.destinationLng,
        },
        vehicleType: routeReq.vehicleType,
        emergencyPriority: routeReq.emergencyPriority,
        incidentType: routeReq.incidentType,
        notes: routeReq.notes,
        routes,
        aiAnalysis,
        createdAt: routeReq.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/routes/history
   */
  public async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryValidation = historyQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        throw new ValidationError('Invalid query parameters', queryValidation.error.format());
      }

      const { page, limit, vehicleType, emergencyPriority, startDate, endDate, search } = queryValidation.data;
      const userId = (req as any).user?.id || 'operator-default';

      if (mongoose.connection.readyState !== 1) {
        // Return empty list if DB offline
        res.status(200).json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
        return;
      }

      const filter: any = { userId };
      if (vehicleType) filter.vehicleType = vehicleType;
      if (emergencyPriority) filter.emergencyPriority = emergencyPriority;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
      if (search) {
        filter.$or = [
          { originText: { $regex: search, $options: 'i' } },
          { destinationText: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await RouteRequestModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const requests = await RouteRequestModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Attach route summary for each
      const enhancedRequests = await Promise.all(
        requests.map(async (reqDoc) => {
          const routes = await RouteModel.find({ requestId: reqDoc._id }).lean();
          const aiAnalysis = await AIAnalysisModel.findOne({ requestId: reqDoc._id }).lean();
          const recommended = routes.find((r) => r.isRecommended) || routes[0];

          return {
            id: reqDoc._id.toString(),
            origin: { address: reqDoc.originText, lat: reqDoc.originLat, lng: reqDoc.originLng },
            destination: { address: reqDoc.destinationText, lat: reqDoc.destinationLat, lng: reqDoc.destinationLng },
            vehicleType: reqDoc.vehicleType,
            emergencyPriority: reqDoc.emergencyPriority,
            incidentType: reqDoc.incidentType,
            notes: reqDoc.notes,
            recommendedRouteName: recommended?.name || 'Primary Corridor',
            etaMinutes: recommended ? Math.round(recommended.durationSeconds / 60) : 0,
            distanceMeters: recommended?.distanceMeters || 0,
            overallScore: recommended?.overallScore || 0,
            trafficLevel: recommended?.trafficLevel || 'low',
            riskLevel: recommended?.riskLevel || 'low',
            aiSummary: aiAnalysis?.summary || 'AI Analysis completed',
            confidenceScore: aiAnalysis?.confidenceScore || 85,
            routesCount: routes.length,
            createdAt: reqDoc.createdAt,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: enhancedRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/routes/:requestId
   */
  public async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
      const userId = (req as any).user?.id || 'operator-default';

      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ValidationError('Invalid request ID format');
      }

      if (mongoose.connection.readyState === 1) {
        const deleted = await RouteRequestModel.findOneAndDelete({
          _id: requestId,
          userId, // Ensure owner
        });

        if (!deleted) {
          throw new NotFoundError('Route request');
        }

        // Cascade delete routes & AI analysis
        await RouteModel.deleteMany({ requestId });
        await AIAnalysisModel.deleteMany({ requestId });
      }

      res.status(200).json({
        success: true,
        message: 'Emergency route request deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const routesController = new RoutesController();
