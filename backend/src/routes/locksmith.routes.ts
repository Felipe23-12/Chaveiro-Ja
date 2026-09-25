import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateStatus,
  verifyDocuments,
  getNearby,
  rate,
} from '../controllers/locksmithController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// ============================================
// PROTECTED ROUTES - LOCKSMITH ONLY
// ============================================

/**
 * GET /api/locksmiths/me
 * Obter perfil do encanador autenticado
 */
router.get('/me', authMiddleware, requireRole(['locksmith']), getProfile);

/**
 * PUT /api/locksmiths/me
 * Atualizar perfil do encanador
 */
router.put('/me', authMiddleware, requireRole(['locksmith']), updateProfile);

/**
 * PUT /api/locksmiths/status
 * Alterar status (online/offline)
 */
router.put('/status', authMiddleware, requireRole(['locksmith']), updateStatus);

/**
 * POST /api/locksmiths/verify
 * Verificar documentos
 */
router.post('/verify', authMiddleware, requireRole(['locksmith']), verifyDocuments);

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/locksmiths/nearby
 * Buscar encanadores próximos
 * Query: latitude, longitude, max_distance (opcional)
 */
router.get('/nearby', getNearby);

/**
 * POST /api/locksmiths/:locksmith_id/rate
 * Avaliar encanador
 */
router.post('/:locksmith_id/rate', rate);

export default router;
