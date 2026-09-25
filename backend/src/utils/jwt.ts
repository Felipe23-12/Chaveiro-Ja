import jwt from 'jsonwebtoken';
import type { JWTPayload, RefreshTokenPayload } from '../types/index.js';

// Secrets com pelo menos 32 caracteres
const ACCESS_SECRET = 'my_super_secret_key_for_jwt_access_token_generation';
const REFRESH_SECRET = 'my_super_secret_key_for_jwt_refresh_token_generation';

export const generateAccessToken = (
  userId: string,
  email: string,
  userType: string
): string => {
  const payload: JWTPayload = {
    sub: userId,
    email,
    type: userType as any,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 horas
  };

  return jwt.sign(payload, ACCESS_SECRET, { algorithm: 'HS256' });
};

export const generateRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = {
    sub: userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800, // 7 dias
  };

  return jwt.sign(payload, REFRESH_SECRET, { algorithm: 'HS256' });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verify Error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] }) as RefreshTokenPayload;
    return decoded.type === 'refresh' ? decoded : null;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload | null;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  return !decoded || decoded.exp < Math.floor(Date.now() / 1000);
};

export const getTimeUntilExpiration = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded) return 0;
  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
};
