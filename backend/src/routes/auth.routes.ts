import { Router } from 'express';
import {
  register,
  login,
  refresh,
  getCurrentUser,
  logout,
  verifyToken,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Fazer login com email e senha
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
router.post('/refresh', refresh);

// ============================================
// PROTECTED ROUTES
// ============================================

/**
 * GET /api/auth/me
 * Obter dados do usuário autenticado
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * POST /api/auth/logout
 * Fazer logout
 */
router.post('/logout', authMiddleware, logout);

/**
 * GET /api/auth/verify
 * Verificar se token é válido
 */
router.get('/verify', authMiddleware, verifyToken);

export default router;
