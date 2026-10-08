import { RouteRequestPayload, RouteAnalysisResult } from '../../types';
import { googleMapsService } from '../maps/googleMapsService';
import { geminiService } from '../gemini/geminiClient';
import { routeCacheService } from './cacheService';
import { RouteRequestModel } from '../../models/RouteRequest';
import { RouteModel } from '../../models/Route';
import { AIAnalysisModel } from '../../models/AIAnalysis';
import { SystemLogModel } from '../../models/User';
import { logger } from '../../utils/logger';
import mongoose from 'mongoose';

export class RouteOrchestrator {
  /**
   * Complete orchestration of emergency route analysis
   */
  public async analyzeEmergencyRoute(
    payload: RouteRequestPayload,
    bypassCache = false
  ): Promise<RouteAnalysisResult> {
    const startTime = Date.now();
    const { origin, destination, vehicleType, emergencyPriority, incidentType, notes, userId = 'operator-default' } = payload;

    // 0. Auto-geocode coordinates via Google Maps if lat/lng are missing or 0
    if ((!origin.lat && !origin.lng) || (origin.lat === 0 && origin.lng === 0)) {
      const geocodedOrigin = await googleMapsService.geocodeAddress(origin.address);
      origin.lat = geocodedOrigin.lat;
      origin.lng = geocodedOrigin.lng;
    }
    if ((!destination.lat && !destination.lng) || (destination.lat === 0 && destination.lng === 0)) {
      const geocodedDest = await googleMapsService.geocodeAddress(destination.address);
      destination.lat = geocodedDest.lat;
      destination.lng = geocodedDest.lng;
    }

    // 1. Cache Check
    if (!bypassCache) {
      const cached = routeCacheService.get(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng,
        vehicleType,
        emergencyPriority
      );
      if (cached) {
        logger.info('Returning cached emergency route analysis result');
        return cached;
      }
    }

    // 2. Fetch Directions & Alternative Routes via Google Routes API (or OSRM/resilient fallback)
    logger.info(`Fetching Google routing options from [${origin.address} (${origin.lat}, ${origin.lng})] to [${destination.address} (${destination.lat}, ${destination.lng})] for [${vehicleType}]`);
    const routes = await googleMapsService.getRoutes(
      origin,
      destination,
      vehicleType,
      emergencyPriority,
      incidentType
    );

    // 3. AI Route Analysis via Gemini (strictly evaluates route metadata, does NOT generate fake geometries)
    const emergencyContext = {
      vehicleType,
      emergencyPriority,
      incidentType,
      notes,
      originAddress: origin.address,
      destinationAddress: destination.address,
    };

    const { analysis: aiAnalysis, isFallback: isAiFallback } = await geminiService.analyzeRoutes(
      emergencyContext,
      routes
    );

    // Update recommendation based on AI analysis if valid routeIndex provided
    let recommendedIndex = aiAnalysis.recommendedRouteIndex;
    if (recommendedIndex < 0 || recommendedIndex >= routes.length) {
      recommendedIndex = 0;
    }

    // Mark recommended status on routes
    routes.forEach((r, idx) => {
      r.isRecommended = idx === recommendedIndex;
    });

    const recommendedRoute = routes[recommendedIndex];

    // 4. Persist to MongoDB (if MongoDB connection is active)
    let savedRequestId = new mongoose.Types.ObjectId().toString();
    try {
      if (mongoose.connection.readyState === 1) {
        const routeRequestDoc = await RouteRequestModel.create({
          userId,
          originText: origin.address,
          destinationText: destination.address,
          originLat: origin.lat,
          originLng: origin.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          vehicleType,
          emergencyPriority,
          incidentType,
          notes,
          recommendedRouteId: recommendedRoute.id,
        });

        savedRequestId = routeRequestDoc._id.toString();

        // Save routes
        const routeDocs = routes.map((r) => ({
          requestId: routeRequestDoc._id,
          routeIndex: r.routeIndex,
          name: r.name,
          summary: r.summary,
          distanceMeters: r.distanceMeters,
          durationSeconds: r.durationSeconds,
          trafficDurationSeconds: r.trafficDurationSeconds,
          trafficLevel: r.trafficLevel,
          predictedDelaySeconds: r.predictedDelaySeconds,
          riskLevel: r.riskLevel,
          reliabilityScore: r.reliabilityScore,
          emergencyScore: r.emergencyScore,
          overallScore: r.overallScore,
          encodedPolyline: r.encodedPolyline,
          path: r.path,
          segments: r.segments,
          warnings: r.warnings,
          isRecommended: r.isRecommended,
        }));

        await RouteModel.insertMany(routeDocs);

        // Save AI Analysis
        await AIAnalysisModel.create({
          requestId: routeRequestDoc._id,
          recommendedRouteIndex: recommendedIndex,
          confidenceScore: aiAnalysis.confidenceScore,
          summary: aiAnalysis.summary,
          routeAnalyses: aiAnalysis.routeAnalyses,
          recommendations: aiAnalysis.recommendations,
          isFallback: isAiFallback,
        });

        // Log operation
        await SystemLogModel.create({
          action: 'ROUTE_ANALYSIS_COMPLETED',
          userId,
          requestId: savedRequestId,
          durationMs: Date.now() - startTime,
          metadata: {
            vehicleType,
            emergencyPriority,
            routesCount: routes.length,
            isAiFallback,
          },
        });
      }
    } catch (dbError: any) {
      logger.warn(`MongoDB persistence non-fatal warning: ${dbError?.message || dbError}`);
    }

    const result: RouteAnalysisResult = {
      success: true,
      requestId: savedRequestId,
      recommendedRouteId: recommendedRoute.id,
      recommendedRouteIndex: recommendedIndex,
      origin,
      destination,
      vehicleType,
      emergencyPriority,
      incidentType,
      notes,
      routes,
      aiAnalysis,
      isAiFallback,
      createdAt: new Date().toISOString(),
    };

    // 5. Store in cache
    routeCacheService.set(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
      vehicleType,
      emergencyPriority,
      result
    );

    return result;
  }
}

export const routeOrchestrator = new RouteOrchestrator();
