import mongoose, { Schema, Document } from 'mongoose';
import { VehicleType, EmergencyPriority, IncidentType } from '../types';

export interface IRouteRequest extends Document {
  userId: string;
  originText: string;
  destinationText: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  vehicleType: VehicleType;
  emergencyPriority: EmergencyPriority;
  incidentType?: IncidentType;
  notes?: string;
  recommendedRouteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RouteRequestSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, default: 'operator-default', index: true },
    originText: { type: String, required: true },
    destinationText: { type: String, required: true },
    originLat: { type: Number, required: true },
    originLng: { type: Number, required: true },
    destinationLat: { type: Number, required: true },
    destinationLng: { type: Number, required: true },
    vehicleType: {
      type: String,
      required: true,
      enum: ['ambulance', 'fire_engine', 'police', 'rescue', 'other'],
    },
    emergencyPriority: {
      type: String,
      required: true,
      enum: ['critical', 'high', 'medium', 'low'],
    },
    incidentType: {
      type: String,
      enum: ['medical', 'accident', 'fire', 'crime', 'natural_disaster', 'rescue', 'other'],
    },
    notes: { type: String, maxlength: 500 },
    recommendedRouteId: { type: String },
  },
  {
    timestamps: true,
  }
);

RouteRequestSchema.index({ createdAt: -1 });
RouteRequestSchema.index({ userId: 1, createdAt: -1 });

export const RouteRequestModel = mongoose.model<IRouteRequest>('RouteRequest', RouteRequestSchema);
