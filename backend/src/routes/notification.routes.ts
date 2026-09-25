import { Router } from 'express';
import {
  registerToken,
  getMyNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register-token', authMiddleware, registerToken);
router.get('/', authMiddleware, getMyNotifications);
router.put('/:notification_id/read', markNotificationAsRead);

export default router;
