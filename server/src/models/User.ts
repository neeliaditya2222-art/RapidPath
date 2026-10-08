import mongoose, { Schema, Document } from 'mongoose';
import { VehicleType, EmergencyPriority } from '../types';

export interface IUserDocument extends Document {
  firebaseUid?: string;
  email: string;
  name: string;
  role: string;
  badgeNumber?: string;
  jurisdiction?: string;
  phone?: string;
  organization?: string;
  photoURL?: string;
  memberSince?: string;
  lastLogin?: string;
  preferences?: {
    notifications: boolean;
    emailNotifications: boolean;
    routeAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    firebaseUid: { type: String, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Dispatcher' },
    badgeNumber: { type: String },
    jurisdiction: { type: String, default: 'Metropolitan Emergency Dispatch Center 01' },
    phone: { type: String, default: '+91 98765 43210' },
    organization: { type: String, default: 'Emergency Operations Center' },
    photoURL: { type: String },
    memberSince: { type: String, default: 'October 2026' },
    lastLogin: { type: String },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      routeAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

export interface ISettingsDocument extends Document {
  userId: string;
  refreshIntervalSeconds: number;
  defaultVehicleType: VehicleType;
  defaultEmergencyPriority: EmergencyPriority;
  mapTheme: 'dark' | 'light' | 'tactical' | 'satellite';
  autoRerouteOnCongestion: boolean;
  soundAlertsEnabled: boolean;
  simulationMode: boolean;
  geminiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    refreshIntervalSeconds: { type: Number, default: 30 },
    defaultVehicleType: { type: String, default: 'ambulance' },
    defaultEmergencyPriority: { type: String, default: 'critical' },
    mapTheme: { type: String, default: 'tactical' },
    autoRerouteOnCongestion: { type: Boolean, default: true },
    soundAlertsEnabled: { type: Boolean, default: true },
    simulationMode: { type: Boolean, default: false },
    geminiModel: { type: String, default: 'gemini-1.5-flash' },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model<ISettingsDocument>('Settings', SettingsSchema);

export interface ISystemLogDocument extends Document {
  action: string;
  level: 'info' | 'warn' | 'error';
  userId?: string;
  requestId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const SystemLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },
    level: { type: String, default: 'info' },
    userId: { type: String, index: true },
    requestId: { type: String, index: true },
    durationMs: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SystemLogModel = mongoose.model<ISystemLogDocument>('SystemLog', SystemLogSchema);
