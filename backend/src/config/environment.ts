import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ============================================
// ENVIRONMENT SCHEMA VALIDATION
// ============================================

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  // Mercado Pago
  MERCADO_PAGO_CLIENT_ID: z.string().optional(),
  MERCADO_PAGO_CLIENT_SECRET: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),

  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Admin
  ADMIN_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let config: Env;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Erro nas variáveis de ambiente:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// ============================================
// EXPORT CONFIG
// ============================================

export const environment = {
  // App
  nodeEnv: config.NODE_ENV,
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  port: config.PORT,
  logLevel: config.LOG_LEVEL,

  // Database
  databaseUrl: config.DATABASE_URL,

  // JWT
  jwt: {
    secret: config.JWT_SECRET,
    refreshSecret: config.JWT_REFRESH_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
  },

  // OAuth
  google: {
    clientId: config.GOOGLE_CLIENT_ID || '',
    clientSecret: config.GOOGLE_CLIENT_SECRET || '',
    redirectUri: config.GOOGLE_REDIRECT_URI || '',
  },

  // Mercado Pago
  mercadoPago: {
    clientId: config.MERCADO_PAGO_CLIENT_ID || '',
    clientSecret: config.MERCADO_PAGO_CLIENT_SECRET || '',
    webhookSecret: config.MERCADO_PAGO_WEBHOOK_SECRET || '',
  },

  // Google Maps
  googleMaps: {
    apiKey: config.GOOGLE_MAPS_API_KEY || '',
  },

  // Firebase
  firebase: {
    projectId: config.FIREBASE_PROJECT_ID || '',
    privateKey: config.FIREBASE_PRIVATE_KEY || '',
    clientEmail: config.FIREBASE_CLIENT_EMAIL || '',
  },

  // Redis
  redis: {
    url: config.REDIS_URL,
  },

  // Admin
  admin: {
    secret: config.ADMIN_SECRET || '',
  },
};

export default environment;
