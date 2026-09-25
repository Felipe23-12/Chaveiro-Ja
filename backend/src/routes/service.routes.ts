import { Router } from 'express';
import {
  getServices,
  getService,
  getByCategory,
  create,
  update,
  deleteOne,
} from '../controllers/serviceController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/services
 * Listar todos os tipos de serviço
 */
router.get('/', getServices);

/**
 * GET /api/services/:id
 * Obter detalhes de um serviço
 */
router.get('/:id', getService);

/**
 * GET /api/services/category/:category
 * Buscar serviços por categoria
 */
router.get('/category/:category', getByCategory);

// ============================================
// PROTECTED ROUTES - ADMIN ONLY
// ============================================

/**
 * POST /api/services
 * Criar novo tipo de serviço
 */
router.post('/', authMiddleware, requireRole(['admin']), create);

/**
 * PUT /api/services/:id
 * Atualizar tipo de serviço
 */
router.put('/:id', authMiddleware, requireRole(['admin']), update);

/**
 * DELETE /api/services/:id
 * Deletar tipo de serviço
 */
router.delete('/:id', authMiddleware, requireRole(['admin']), deleteOne);

export default router;
