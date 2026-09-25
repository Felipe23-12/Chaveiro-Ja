import { Router } from 'express';
import {
  updateLocation,
  getLocation,
  getHistory,
  getDistance,
} from '../controllers/locationController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/locations/update
 * Atualizar localização do chaveiro (chaveiro)
 */
router.post('/update', authMiddleware, requireRole(['locksmith']), updateLocation);

/**
 * GET /api/locations/:locksmith_id
 * Obter localização atual do chaveiro (público)
 */
router.get('/:locksmith_id', getLocation);

/**
 * GET /api/locations/:locksmith_id/history
 * Obter histórico de localização (público)
 */
router.get('/:locksmith_id/history', getHistory);

/**
 * POST /api/locations/:locksmith_id/distance
 * Calcular distância até cliente (público)
 */
router.post('/:locksmith_id/distance', getDistance);

export default router;
