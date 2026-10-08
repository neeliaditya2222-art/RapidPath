import { Router } from 'express';
import routeRoutes from './routeRoutes';
import aiRoutes from './aiRoutes';
import settingsRoutes from './settingsRoutes';
import healthRoutes from './healthRoutes';
import locationRoutes from './locationRoutes';
import hospitalRoutes from './hospitalRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.all('/', (req, res) => {
  res.status(200).json({
    service: 'RapidPath Emergency Routing API',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'RapidPath backend API is operational',
    endpoints: {
      health: '/api/health',
      routes: '/api/routes',
      auth: '/api/auth',
      hospitals: '/api/hospitals',
      ai: '/api/ai',
      location: '/api/location',
      settings: '/api/settings',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/routes', routeRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);
router.use('/location', locationRoutes);
router.use('/hospitals', hospitalRoutes);

export default router;
