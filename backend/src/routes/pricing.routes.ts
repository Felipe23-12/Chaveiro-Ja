import { Router } from 'express';
import {
  getPrice,
  quote,
  getRulesAdmin,
  setPrice,
  createRuleAdmin,
  updateRuleAdmin,
  deleteRuleAdmin,
} from '../controllers/pricingController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/pricing/services/:service_id
 * Obter preço base de um serviço
 */
router.get('/services/:service_id', getPrice);

/**
 * POST /api/pricing/quote
 * Calcular orçamento com regras aplicadas
 * Body: { service_id, time_of_day, weather, urgency, region }
 */
router.post('/quote', quote);

// ============================================
// PROTECTED ROUTES - ADMIN ONLY
// ============================================

/**
 * GET /api/pricing/rules
 * Listar todas as regras de preço
 */
router.get('/rules', authMiddleware, requireRole(['admin']), getRulesAdmin);

/**
 * POST /api/pricing/rules
 * Criar nova regra de preço
 */
router.post('/rules', authMiddleware, requireRole(['admin']), createRuleAdmin);

/**
 * PUT /api/pricing/rules/:id
 * Atualizar regra de preço
 */
router.put('/rules/:id', authMiddleware, requireRole(['admin']), updateRuleAdmin);

/**
 * DELETE /api/pricing/rules/:id
 * Deletar regra de preço
 */
router.delete('/rules/:id', authMiddleware, requireRole(['admin']), deleteRuleAdmin);

/**
 * POST /api/pricing/set-price
 * Definir preço base de um serviço
 * Body: { service_id, base_price }
 */
router.post('/set-price', authMiddleware, requireRole(['admin']), setPrice);

export default router;
