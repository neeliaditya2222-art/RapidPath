import mongoose, { Schema, Document } from 'mongoose';
import { TrafficLevel, RiskLevel, RouteSegment } from '../types';

export interface IRouteDocument extends Document {
  requestId: mongoose.Types.ObjectId;
  routeIndex: number;
  name: string;
  summary: string;
  distanceMeters: number;
  durationSeconds: number;
  trafficDurationSeconds: number;
  trafficLevel: TrafficLevel;
  predictedDelaySeconds: number;
  riskLevel: RiskLevel;
  reliabilityScore: number;
  emergencyScore: number;
  overallScore: number;
  encodedPolyline: string;
  path: [number, number][];
  segments: RouteSegment[];
  warnings: string[];
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSegmentSchema = new Schema(
  {
    start: { lat: Number, lng: Number },
    end: { lat: Number, lng: Number },
    distanceMeters: Number,
    durationSeconds: Number,
    trafficLevel: { type: String, enum: ['low', 'moderate', 'heavy', 'severe'] },
    roadName: String,
    instruction: String,
  },
  { _id: false }
);

const RouteSchema: Schema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'RouteRequest', required: true, index: true },
    routeIndex: { type: Number, required: true },
    name: { type: String, required: true },
    summary: { type: String, default: '' },
    distanceMeters: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    trafficDurationSeconds: { type: Number, required: true },
    trafficLevel: {
      type: String,
      required: true,
      enum: ['low', 'moderate', 'heavy', 'severe'],
      default: 'moderate',
    },
    predictedDelaySeconds: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    reliabilityScore: { type: Number, required: true },
    emergencyScore: { type: Number, required: true },
    overallScore: { type: Number, required: true },
    encodedPolyline: { type: String, required: true },
    path: { type: [[Number]], default: [] },
    segments: [RouteSegmentSchema],
    warnings: { type: [String], default: [] },
    isRecommended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

RouteSchema.index({ requestId: 1, routeIndex: 1 });

export const RouteModel = mongoose.model<IRouteDocument>('Route', RouteSchema);
