import { z } from 'zod';

export const locationPointSchema = z.object({
  address: z.string().min(2, 'Address must be at least 2 characters'),
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  placeId: z.string().optional(),
});

export const vehicleTypeSchema = z.enum([
  'ambulance',
  'fire_engine',
  'police',
  'rescue',
  'other',
]);

export const emergencyPrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
]);

export const incidentTypeSchema = z.enum([
  'medical',
  'accident',
  'fire',
  'crime',
  'natural_disaster',
  'rescue',
  'other',
]);

export const routeRequestSchema = z.object({
  origin: locationPointSchema,
  destination: locationPointSchema,
  vehicleType: vehicleTypeSchema,
  emergencyPriority: emergencyPrioritySchema,
  incidentType: incidentTypeSchema.optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  vehicleType: vehicleTypeSchema.optional(),
  emergencyPriority: emergencyPrioritySchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

export type RouteRequestInput = z.infer<typeof routeRequestSchema>;
export type HistoryQueryParams = z.infer<typeof historyQuerySchema>;
