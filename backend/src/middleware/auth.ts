import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; type: string; email: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      console.log('❌ Sem token no header');
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    console.log('🔐 Token recebido:', token.substring(0, 20) + '...');
    const decoded = verifyAccessToken(token);
    console.log('🔍 Token decodificado:', decoded ? 'SIM' : 'NÃO');

    if (!decoded) {
      console.log('❌ Falha ao verificar token');
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }

    req.user = {
      id: decoded.sub,
      type: decoded.type,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.type)) {
      res.status(403).json({ error: 'Permissão negada' });
      return;
    }

    next();
  };
};