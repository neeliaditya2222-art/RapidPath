import { z } from 'zod';
import { vehicleTypeSchema, emergencyPrioritySchema } from './routeRequest.validator';

export const updateSettingsSchema = z.object({
  refreshIntervalSeconds: z.number().min(5).max(300).optional(),
  defaultVehicleType: vehicleTypeSchema.optional(),
  defaultEmergencyPriority: emergencyPrioritySchema.optional(),
  mapTheme: z.enum(['dark', 'light', 'tactical', 'satellite']).optional(),
  autoRerouteOnCongestion: z.boolean().optional(),
  soundAlertsEnabled: z.boolean().optional(),
  simulationMode: z.boolean().optional(),
  geminiModel: z.string().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
