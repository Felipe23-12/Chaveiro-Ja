import { pgTable, text, integer, numeric, timestamp, boolean, varchar, point, jsonb, uuid } from 'drizzle-orm/pg-core';

// ============================================
// USERS
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  user_type: varchar('user_type', { length: 20 }).notNull(), // customer, locksmith, admin
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============================================
// CUSTOMER PROFILES
// ============================================

export const customer_profiles = pgTable('customer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  postal_code: varchar('postal_code', { length: 20 }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  document_type: varchar('document_type', { length: 50 }),
  document: varchar('document', { length: 50 }),
  birthdate: varchar('birthdate', { length: 10 }),
  profile_complete: boolean('profile_complete').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============================================
// LOCKSMITH PROFILES
// ============================================

export const locksmith_profiles = pgTable('locksmith_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  company_name: varchar('company_name', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  description: text('description'),
  years_experience: integer('years_experience'),
  rating: numeric('rating', { precision: 3, scale: 1 }).default('0'),
  reviews_count: integer('reviews_count').default(0),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  service_radius_km: integer('service_radius_km'),
  hourly_rate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  document_type: varchar('document_type', { length: 50 }),
  document: varchar('document', { length: 50 }),
  document_verified: boolean('document_verified').default(false),
  bank_account: varchar('bank_account', { length: 100 }),
  status: varchar('status', { length: 20 }).default('offline'), // online, offline, blocked
  profile_complete: boolean('profile_complete').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICES
// ============================================

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  icon: varchar('icon', { length: 100 }),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============================================
// SERVICE REQUESTS / JOBS
// ============================================

export const service_requests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  customer_id: uuid('customer_id').references(() => users.id),
  locksmith_id: uuid('locksmith_id').references(() => users.id),
  service_id: uuid('service_id').references(() => services.id),
  status: varchar('status', { length: 50 }).default('draft'),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  address: varchar('address', { length: 255 }),
  price: numeric('price', { precision: 10, scale: 2 }),
  estimated_arrival: integer('estimated_arrival'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  completed_at: timestamp('completed_at'),
  cancelled_at: timestamp('cancelled_at'),
  cancel_reason: varchar('cancel_reason', { length: 255 }),
});

// ============================================
// SERVICE OFFERS
// ============================================

export const service_offers = pgTable('service_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').references(() => service_requests.id),
  locksmith_id: uuid('locksmith_id').references(() => users.id),
  price: numeric('price', { precision: 10, scale: 2 }),
  eta: integer('eta'),
  status: varchar('status', { length: 20 }).default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  responded_at: timestamp('responded_at'),
});

// ============================================
// LOCATION UPDATES
// ============================================

export const location_updates = pgTable('location_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  locksmith_id: uuid('locksmith_id').references(() => users.id),
  request_id: uuid('request_id').references(() => service_requests.id),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  accuracy: numeric('accuracy', { precision: 10, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ============================================
// MESSAGES / CONVERSATIONS
// ============================================

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').references(() => service_requests.id),
  participant_ids: jsonb('participant_ids'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').references(() => conversations.id),
  sender_id: uuid('sender_id').references(() => users.id),
  content: text('content'),
  read: boolean('read').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ============================================
// REVIEWS
// ============================================

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').references(() => service_requests.id),
  reviewer_id: uuid('reviewer_id').references(() => users.id),
  reviewed_id: uuid('reviewed_id').references(() => users.id),
  score: integer('score'),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow(),
});

// ============================================
// PRICING
// ============================================

export const pricing_rules = pgTable('pricing_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  service_id: uuid('service_id').references(() => services.id),
  condition: varchar('condition', { length: 50 }),
  multiplier: numeric('multiplier', { precision: 5, scale: 2 }),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const service_prices = pgTable('service_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  service_id: uuid('service_id').references(() => services.id),
  base_price: numeric('base_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('BRL'),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============================================
// PAYMENTS
// ============================================

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').references(() => service_requests.id),
  customer_id: uuid('customer_id').references(() => users.id),
  locksmith_id: uuid('locksmith_id').references(() => users.id),
  amount: numeric('amount', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('pending'),
  payment_method: varchar('payment_method', { length: 50 }),
  mercado_pago_id: varchar('mercado_pago_id', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============================================
// AUDIT LOG
// ============================================

export const audit_logs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor_user_id: uuid('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 100 }),
  entity_type: varchar('entity_type', { length: 100 }),
  entity_id: varchar('entity_id', { length: 255 }),
  before: jsonb('before'),
  after: jsonb('after'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow(),
});
