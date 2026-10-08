import { z } from 'zod';

export const routePlannerFormSchema = z.object({
  originAddress: z.string().min(2, 'Origin address is required (minimum 2 characters)'),
  originLat: z.number().min(-90).max(90),
  originLng: z.number().min(-180).max(180),
  destinationAddress: z.string().min(2, 'Destination address is required (minimum 2 characters)'),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  vehicleType: z.enum(['ambulance', 'fire_engine', 'police', 'rescue', 'other']),
  emergencyPriority: z.enum(['critical', 'high', 'medium', 'low']),
  incidentType: z.enum([
    'medical',
    'accident',
    'fire',
    'crime',
    'natural_disaster',
    'rescue',
    'other',
  ]).optional(),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
});

export type RoutePlannerFormValues = z.infer<typeof routePlannerFormSchema>;
