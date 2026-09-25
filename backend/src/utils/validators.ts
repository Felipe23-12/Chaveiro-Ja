import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

// ---- AUTH SCHEMAS ----

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  last_name: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
});

// ---- CUSTOMER SCHEMAS ----

export const CompleteCustomerProfileSchema = z.object({
  address: z.string().min(10, 'Endereço inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().regex(/^[A-Z]{2}$/, 'Estado deve ser 2 letras maiúsculas'),
  postal_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
  document_type: z.enum(['cpf', 'rg', 'passport'], {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  document: z.string().min(1, 'Documento é obrigatório'),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
});

export const UpdateCustomerProfileSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().min(10).optional(),
  city: z.string().min(2).optional(),
  state: z.string().regex(/^[A-Z]{2}$/).optional(),
  postal_code: z.string().regex(/^\d{5}-?\d{3}$/).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ---- LOCKSMITH SCHEMAS ----

export const RegisterLocksmithSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  last_name: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  business_name: z.string().min(2, 'Nome do negócio inválido'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  document: z.string().min(1, 'Documento é obrigatório'),
});

export const UpdateLocksmithProfileSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  business_name: z.string().min(2).optional(),
});

export const UpdateLocksmithStatusSchema = z.object({
  status: z.enum(['online', 'offline', 'blocked'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

// ---- SERVICE REQUEST SCHEMAS ----

export const CreateServiceRequestSchema = z.object({
  service_id: z.string().uuid('Service ID inválido'),
  address: z.string().min(10, 'Endereço inválido'),
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  vehicle_plate: z
    .string()
    .regex(/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, 'Placa de veículo inválida')
    .optional(),
});

export const AcceptServiceRequestSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
});

export const CancelServiceRequestSchema = z.object({
  reason: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres'),
});

// ---- LOCATION SCHEMAS ----

export const UpdateLocationSchema = z.object({
  service_request_id: z.string().uuid('ID do serviço inválido'),
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
  accuracy: z.number().min(0).optional(),
  speed: z.number().min(0).optional(),
});

// ---- CHAT SCHEMAS ----

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(5000, 'Mensagem muito longa'),
});

// ---- REVIEW SCHEMAS ----

export const CreateReviewSchema = z.object({
  rating: z.number().min(1, 'Rating mínimo é 1').max(5, 'Rating máximo é 5'),
  comment: z.string().max(1000, 'Comentário muito longo').optional(),
});

// ---- PAYMENT SCHEMAS ----

export const CreatePaymentSchema = z.object({
  payment_method: z.enum(['mercado_pago', 'credit_card', 'pix'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  installments: z.number().min(1).max(12).default(1),
});

// ---- HELPERS ----

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Não pode ter todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validar primeiro dígito verificador
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return false;
  }

  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  return remainder === parseInt(cleanCPF.substring(10, 11));
};

/**
 * Validar coordenadas GPS
 */
export const validateCoordinates = (latitude: number, longitude: number): boolean => {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

/**
 * Calcular distância entre dois pontos (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
