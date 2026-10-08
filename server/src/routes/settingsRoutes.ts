import { Router } from 'express';
import { settingsController } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => settingsController.getSettings(req, res, next));
router.patch('/', (req, res, next) => settingsController.updateSettings(req, res, next));

export default router;
