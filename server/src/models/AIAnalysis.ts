import mongoose, { Schema, Document } from 'mongoose';
import { GeminiRouteSingleAnalysis } from '../types';

export interface IAIAnalysisDocument extends Document {
  requestId: mongoose.Types.ObjectId;
  recommendedRouteIndex: number;
  confidenceScore: number;
  summary: string;
  routeAnalyses: GeminiRouteSingleAnalysis[];
  recommendations: string[];
  modelName: string;
  isFallback: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema: Schema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'RouteRequest', required: true, index: true },
    recommendedRouteIndex: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    summary: { type: String, required: true },
    routeAnalyses: [
      {
        routeIndex: Number,
        trafficAssessment: String,
        delayRisk: String,
        riskLevel: String,
        reliabilityScore: Number,
        emergencySuitabilityScore: Number,
        reasoning: String,
        riskFactors: [String],
      },
    ],
    recommendations: { type: [String], default: [] },
    modelName: { type: String, default: 'gemini-1.5-flash' },
    isFallback: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const AIAnalysisModel = mongoose.model<IAIAnalysisDocument>('AIAnalysis', AIAnalysisSchema);
