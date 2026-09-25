import { Router } from 'express';
import { create, getUser } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.post('/', authMiddleware, create);
router.get('/:user_id', getUser);
export default router;
