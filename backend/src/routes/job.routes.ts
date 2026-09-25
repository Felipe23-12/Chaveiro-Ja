import { Router } from 'express';
import {
  create,
  get,
  getMyJobs,
  search,
  makeOffer,
  getOffers,
  getMyOffers,
  acceptOffer,
  updateStatus,
  setEnRoute,
  setArrived,
  setInProgress,
  setCompleted,
  cancel,
} from '../controllers/jobController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// ============================================
// CUSTOMER ROUTES
// ============================================

/**
 * POST /api/jobs
 * Criar novo pedido (cliente)
 */
router.post('/', authMiddleware, requireRole(['customer']), create);

/**
 * GET /api/jobs/my
 * Listar meus pedidos (cliente)
 */
router.get('/my', authMiddleware, requireRole(['customer']), getMyJobs);

/**
 * POST /api/jobs/search
 * Buscar chaveiros disponíveis
 */
router.post('/search', authMiddleware, requireRole(['customer']), search);

/**
 * POST /api/jobs/cancel
 * Cancelar pedido
 */
router.post('/cancel', authMiddleware, requireRole(['customer']), cancel);

// ============================================
// LOCKSMITH ROUTES
// ============================================

/**
 * POST /api/jobs/offer
 * Criar oferta para um pedido (chaveiro)
 */
router.post('/offer', authMiddleware, requireRole(['locksmith']), makeOffer);

/**
 * GET /api/jobs/my-offers
 * Listar minhas ofertas (chaveiro)
 */
router.get('/my-offers', authMiddleware, requireRole(['locksmith']), getMyOffers);

/**
 * POST /api/jobs/accept-offer
 * Aceitar oferta (chaveiro)
 */
router.post('/accept-offer', authMiddleware, requireRole(['locksmith']), acceptOffer);

/**
 * POST /api/jobs/en-route
 * Marcar como a caminho (chaveiro)
 */
router.post('/en-route', authMiddleware, requireRole(['locksmith']), setEnRoute);

/**
 * POST /api/jobs/arrived
 * Marcar como chegou (chaveiro)
 */
router.post('/arrived', authMiddleware, requireRole(['locksmith']), setArrived);

/**
 * POST /api/jobs/in-progress
 * Marcar como em andamento (chaveiro)
 */
router.post('/in-progress', authMiddleware, requireRole(['locksmith']), setInProgress);

/**
 * POST /api/jobs/completed
 * Marcar como concluído (chaveiro)
 */
router.post('/completed', authMiddleware, requireRole(['locksmith']), setCompleted);

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/jobs/:id
 * Obter detalhes de um pedido
 */
router.get('/:id', get);

/**
 * GET /api/jobs/:job_id/offers
 * Listar ofertas de um pedido
 */
router.get('/:job_id/offers', getOffers);

/**
 * POST /api/jobs/status
 * Atualizar status de um pedido (admin)
 */
router.post('/status', authMiddleware, requireRole(['admin']), updateStatus);

export default router;
