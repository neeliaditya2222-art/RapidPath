import { Request, Response, NextFunction } from 'express';
import { updateSettingsSchema } from '../validators/settings.validator';
import { SettingsModel } from '../models/User';
import { ValidationError } from '../utils/errors';
import mongoose from 'mongoose';

const DEFAULT_SETTINGS = {
  refreshIntervalSeconds: 30,
  defaultVehicleType: 'ambulance' as const,
  defaultEmergencyPriority: 'critical' as const,
  mapTheme: 'tactical' as const,
  autoRerouteOnCongestion: true,
  soundAlertsEnabled: true,
  simulationMode: false,
  geminiModel: 'gemini-1.5-flash',
};

export class SettingsController {
  /**
   * GET /api/settings
   */
  public async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'operator-default';

      if (mongoose.connection.readyState === 1) {
        let settings = await SettingsModel.findOne({ userId });
        if (!settings) {
          settings = await SettingsModel.create({
            userId,
            ...DEFAULT_SETTINGS,
          });
        }
        res.status(200).json({ success: true, data: settings });
        return;
      }

      // Memory fallback
      res.status(200).json({
        success: true,
        data: { userId, ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/settings
   */
  public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid settings data', validation.error.format());
      }

      const userId = (req as any).user?.id || 'operator-default';

      if (mongoose.connection.readyState === 1) {
        const updated = await SettingsModel.findOneAndUpdate(
          { userId },
          { $set: validation.data },
          { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updated });
        return;
      }

      res.status(200).json({
        success: true,
        data: { userId, ...DEFAULT_SETTINGS, ...validation.data, updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
