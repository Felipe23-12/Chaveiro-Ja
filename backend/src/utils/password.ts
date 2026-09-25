import bcryptjs from 'bcryptjs';

// ============================================
// PASSWORD FUNCTIONS
// ============================================

/**
 * Gera hash de senha com bcryptjs
 * Usa salt rounds = 12 (recomendado por segurança)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcryptjs.hash(password, saltRounds);
};

/**
 * Compara senha com seu hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    return bcryptjs.compare(password, hash);
  } catch (error) {
    return false;
  }
};

/**
 * Validar força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos 1 letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos 1 letra minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos 1 número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos 1 caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Gera uma senha temporária aleatória
 */
export const generateTemporaryPassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';

  const allChars = uppercase + lowercase + numbers + special;
  let password = '';

  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Embaralhar
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};
