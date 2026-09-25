import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { UserType } from '../types/index.js';

// Mock database - em produção usar banco real
const users = new Map();
let userId = 1;

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: UserType;
  is_active: boolean;
  created_at: Date;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: UserType;
  };
}

// ============================================
// REGISTER
// ============================================

export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  userType: UserType,
  phone?: string
): Promise<AuthResponse> => {
  // Validar email único
  const existingUser = Array.from(users.values()).find(
    (u: User) => u.email === email
  );
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Validar força da senha
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }

  // Hash da senha
  const passwordHash = await hashPassword(password);

  // Criar usuário
  const newUser: User = {
    id: String(userId++),
    email,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    phone,
    user_type: userType,
    is_active: true,
    created_at: new Date(),
  };

  users.set(newUser.id, newUser);

  // Gerar tokens
  const accessToken = generateAccessToken(newUser.id, email, userType);
  const refreshToken = generateRefreshToken(newUser.id);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      user_type: newUser.user_type,
    },
  };
};

// ============================================
// LOGIN
// ============================================

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Encontrar usuário
  const user = Array.from(users.values()).find(
    (u: User) => u.email === email
  ) as User | undefined;

  if (!user) {
    throw new Error('Email ou senha incorretos');
  }

  if (!user.is_active) {
    throw new Error('Usuário inativo');
  }

  // Validar senha
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Email ou senha incorretos');
  }

  // Gerar tokens
  const accessToken = generateAccessToken(user.id, user.email, user.user_type);
  const refreshToken = generateRefreshToken(user.id);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
    },
  };
};

// ============================================
// REFRESH TOKEN
// ============================================

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ access_token: string }> => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new Error('Refresh token inválido ou expirado');
  }

  // Buscar usuário
  const user = users.get(decoded.sub) as User | undefined;
  if (!user || !user.is_active) {
    throw new Error('Usuário não encontrado ou inativo');
  }

  // Gerar novo access token
  const accessToken = generateAccessToken(user.id, user.email, user.user_type);

  return { access_token: accessToken };
};

// ============================================
// GET USER BY ID
// ============================================

export const getUserById = async (userId: string): Promise<User | null> => {
  const user = users.get(userId) as User | undefined;
  return user || null;
};

// ============================================
// VERIFY EMAIL EXISTS
// ============================================

export const emailExists = async (email: string): Promise<boolean> => {
  return Array.from(users.values()).some((u: User) => u.email === email);
};
