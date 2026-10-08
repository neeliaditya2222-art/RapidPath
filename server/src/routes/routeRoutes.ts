import { Router } from 'express';
import { routesController } from '../controllers/routesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware for user scoping
router.use(authMiddleware);

// Analyze new route
router.post('/analyze', (req, res, next) => routesController.analyzeRoute(req, res, next));

// Refresh route
router.post('/:requestId/refresh', (req, res, next) => routesController.refreshRoute(req, res, next));

// Get route history
router.get('/history', (req, res, next) => routesController.getHistory(req, res, next));

// Get route details
router.get('/:requestId', (req, res, next) => routesController.getRouteDetails(req, res, next));

// Delete route
router.delete('/:requestId', (req, res, next) => routesController.deleteRoute(req, res, next));

export default router;
