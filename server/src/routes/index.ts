import { Router } from 'express';
import routeRoutes from './routeRoutes';
import aiRoutes from './aiRoutes';
import settingsRoutes from './settingsRoutes';
import healthRoutes from './healthRoutes';
import locationRoutes from './locationRoutes';
import hospitalRoutes from './hospitalRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/routes', routeRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);
router.use('/location', locationRoutes);
router.use('/hospitals', hospitalRoutes);


export default router;
