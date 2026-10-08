import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Restricted / internal AI analysis endpoint
router.post('/analyze-routes', (req, res, next) => aiController.analyzeRoutes(req, res, next));

export default router;
