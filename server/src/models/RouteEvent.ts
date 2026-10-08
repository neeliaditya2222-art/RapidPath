import mongoose, { Schema, Document } from 'mongoose';

export interface IRouteEventDocument extends Document {
  routeId?: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  eventType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  latitude: number;
  longitude: number;
  source: string;
  createdAt: Date;
}

const RouteEventSchema: Schema = new Schema(
  {
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', index: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'RouteRequest', index: true },
    eventType: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    description: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    source: { type: String, default: 'dispatch-sensor' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

RouteEventSchema.index({ createdAt: -1 });

export const RouteEventModel = mongoose.model<IRouteEventDocument>('RouteEvent', RouteEventSchema);
