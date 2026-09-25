import { Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken, getUserById } from '../services/authService.js';
import type { UserType } from '../types/index.js';

// ============================================
// REGISTER
// ============================================

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name, user_type, phone } = req.body;

    // Validar dados
    if (!email || !password || !first_name || !last_name || !user_type) {
      res.status(400).json({
        success: false,
        error: 'Email, senha, nome, sobrenome e tipo de usuário são obrigatórios',
      });
      return;
    }

    // Registrar usuário
    const authResponse = await registerUser(
      email,
      password,
      first_name,
      last_name,
      user_type as UserType,
      phone
    );

    res.status(201).json({
      success: true,
      data: authResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
};

// ============================================
// LOGIN
// ============================================

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar dados
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios',
      });
      return;
    }

    // Fazer login
    const authResponse = await loginUser(email, password);

    // Opcional: salvar refresh token em cookie
    res.cookie('refresh_token', authResponse.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      success: true,
      data: authResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer login';
    res.status(401).json({
      success: false,
      error: message,
    });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    // Validar dados
    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: 'Refresh token é obrigatório',
      });
      return;
    }

    // Refresh token
    const response = await refreshAccessToken(refresh_token);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao renovar token';
    res.status(401).json({
      success: false,
      error: message,
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
      return;
    }

    const user = await getUserById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        user_type: user.user_type,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

// ============================================
// LOGOUT
// ============================================

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Limpar cookie de refresh token
    res.clearCookie('refresh_token');

    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer logout';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

// ============================================
// VERIFY TOKEN
// ============================================

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        user: req.user,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};
