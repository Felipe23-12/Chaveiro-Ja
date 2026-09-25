import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  completeProfile,
} from '../controllers/customerController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// ============================================
// PROTECTED ROUTES - CUSTOMER ONLY
// ============================================

/**
 * GET /api/customers/me
 * Obter perfil do cliente autenticado
 */
router.get('/me', authMiddleware, requireRole(['customer']), getProfile);

/**
 * PUT /api/customers/me
 * Atualizar perfil do cliente
 */
router.put('/me', authMiddleware, requireRole(['customer']), updateProfile);

/**
 * POST /api/customers/complete-profile
 * Completar perfil do cliente (dados obrigatórios)
 */
router.post(
  '/complete-profile',
  authMiddleware,
  requireRole(['customer']),
  completeProfile
);

export default router;
