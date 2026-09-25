import { Router } from 'express';
import { createCheckout, getPaymentStatus, handleWebhook } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/checkout', authMiddleware, createCheckout);
router.get('/:payment_id', getPaymentStatus);
router.post('/webhook/mercado-pago', handleWebhook);

export default router;
