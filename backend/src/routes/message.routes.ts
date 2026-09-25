import { Router } from 'express';
import { createConv, send, getConvMessages, markRead } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/conversations', authMiddleware, createConv);
router.post('/send', authMiddleware, send);
router.get('/conversations/:conversation_id', getConvMessages);
router.post('/mark-read', authMiddleware, markRead);

export default router;
