import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Sync Firebase user with MongoDB
router.post('/sync', authController.syncUser);

// Retrieve MongoDB user profile
router.get('/profile', authController.getProfile);

// Update MongoDB user profile
router.put('/profile', authController.updateProfile);

export default router;
