import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';

export class HealthController {
  public static getHealth(req: Request, res: Response): void {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const geminiStatus = config.gemini.apiKey ? 'configured' : 'fallback_mode';

    res.status(200).json({
      success: true,
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: mongoStatus,
        geminiAI: geminiStatus,
        routingEngine: 'osrm_active',
        mapTiles: 'openstreetmap_active',
      },
      uptimeSeconds: process.uptime(),
    });
  }
}
