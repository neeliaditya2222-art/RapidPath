import dns from 'dns';
import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

// Configure DNS servers to reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if custom DNS not supported
}

async function bootstrap() {
  const app = createApp();

  // Connect to MongoDB with timeout
  logger.info(`Connecting to MongoDB at: ${config.mongoUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
  
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 6000,
    });
    logger.info('MongoDB connection established successfully');
  } catch (dbErr: any) {
    logger.warn(`MongoDB connection warning: ${dbErr?.message || dbErr}. Server running in resilient in-memory mode.`);
  }

  // Handle DB connection events
  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  const server = app.listen(config.port, () => {
    logger.info(`========================================================`);
    logger.info(`  RapidPath Emergency Routing Server Running on port ${config.port}`);
    logger.info(`  Environment: ${config.env}`);
    logger.info(`  Health check: http://localhost:${config.port}/api/health`);
    logger.info(`  Routing Engine: OSRM (Open Source Routing Machine) + OpenStreetMap`);
    logger.info(`  Location Search: OpenStreetMap Nominatim Geocoding (Zero Google Billing)`);
    logger.info(`========================================================`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully closing HTTP server...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      }
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
