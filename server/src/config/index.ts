import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rapidpath',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    timeoutMs: 15000,
    maxRetries: 2,
  },

  // Google Maps Platform
  maps: {
    serverApiKey: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Cache
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '120', 10),
  },

  // Vehicle-specific routing profiles & priority weighting
  vehicleProfiles: {
    ambulance: {
      speedFactor: 1.15, // Can exceed standard speed with siren/lights
      trafficPenaltyWeight: 1.4, // Avoid heavy congestion at all costs
      reliabilityWeight: 1.3,
      delayRiskWeight: 1.5,
      description: 'Prioritizes fastest arrival and hospital accessibility with low traffic risk',
    },
    fire_engine: {
      speedFactor: 0.95, // Heavy vehicle, slower acceleration, turning constraints
      trafficPenaltyWeight: 1.6, // Bottlenecks and narrow roads severely impede heavy apparatus
      reliabilityWeight: 1.5,
      delayRiskWeight: 1.4,
      description: 'Prioritizes wide arterial corridors, bridge clearances, and predictable reliability',
    },
    police: {
      speedFactor: 1.25, // Agile interceptor units
      trafficPenaltyWeight: 1.2,
      reliabilityWeight: 1.1,
      delayRiskWeight: 1.2,
      description: 'Prioritizes maximum velocity and rapid tactical deployment',
    },
    rescue: {
      speedFactor: 1.05,
      trafficPenaltyWeight: 1.3,
      reliabilityWeight: 1.4,
      delayRiskWeight: 1.3,
      description: 'Prioritizes robust route stability and specialized equipment access',
    },
    other: {
      speedFactor: 1.0,
      trafficPenaltyWeight: 1.2,
      reliabilityWeight: 1.2,
      delayRiskWeight: 1.2,
      description: 'Standard emergency response profile',
    },
  },

  // Emergency priority factors
  priorityWeights: {
    critical: { timeWeight: 0.45, trafficWeight: 0.25, riskWeight: 0.20, reliabilityWeight: 0.10 },
    high: { timeWeight: 0.40, trafficWeight: 0.25, riskWeight: 0.20, reliabilityWeight: 0.15 },
    medium: { timeWeight: 0.35, trafficWeight: 0.25, riskWeight: 0.20, reliabilityWeight: 0.20 },
    low: { timeWeight: 0.30, trafficWeight: 0.25, riskWeight: 0.25, reliabilityWeight: 0.20 },
  },
};
