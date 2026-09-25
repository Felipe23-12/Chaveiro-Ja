// ============================================
// TYPES - CHAVEIRO JÁ
// ============================================

export enum UserType {
  CUSTOMER = 'customer',
  LOCKSMITH = 'locksmith',
  ADMIN = 'admin'
}

export enum JobStatus {
  CREATED = 'created',
  SEARCHING = 'searching',
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED_CUSTOMER = 'cancelled_customer',
  CANCELLED_LOCKSMITH = 'cancelled_locksmith',
  CANCELLED_TIMEOUT = 'cancelled_timeout'
}

export enum LocksmithStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BLOCKED = 'blocked'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum LocksmithMode {
  APPLICATIVO = 'applicativo',
  LIVRE = 'livre'
}

// ============================================
// AUTH TYPES
// ============================================

export interface JWTPayload {
  sub: string; // user_id
  email: string;
  type: UserType;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: UserType;
  is_active: boolean;
}

// ============================================
// CUSTOMER TYPES
// ============================================

export interface CustomerProfile {
  id: string;
  user_id: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  document_type?: string;
  document?: string;
  birthdate?: Date;
  profile_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface CompleteCustomerProfileRequest {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  document_type: string;
  document: string;
  birthdate: string; // ISO 8601
}

// ============================================
// LOCKSMITH TYPES
// ============================================

export interface LocksmithProfile {
  id: string;
  user_id: string;
  business_name: string;
  cpf: string;
  document: string;
  selfie_url?: string;
  status: LocksmithStatus;
  current_latitude?: number;
  current_longitude?: number;
  location_updated_at?: Date;
  mode: LocksmithMode;
  rating: number;
  review_count: number;
  total_jobs: number;
  cancellation_count: number;
  blocked_until?: Date;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLocksmithRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  business_name: string;
  cpf: string;
  document: string;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  requires_vehicle: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// JOB/SERVICE REQUEST TYPES
// ============================================

export interface ServiceRequest {
  id: string;
  customer_id: string;
  service_id: string;
  locksmith_id?: string;
  status: JobStatus;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  vehicle_plate?: string;
  estimated_price?: number;
  final_price?: number;
  payment_status: PaymentStatus;
  cancel_reason?: string;
  created_at: Date;
  accepted_at?: Date;
  completed_at?: Date;
  updated_at: Date;
}

export interface CreateServiceRequestRequest {
  service_id: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  vehicle_plate?: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
  id: string;
  service_request_id: string;
  customer_id: string;
  locksmith_id: string;
  amount: number;
  base_price?: number;
  platform_fee?: number;
  locksmith_amount?: number;
  status: PaymentStatus;
  payment_method?: string;
  provider_transaction_id?: string;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  service_request_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: Date;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

// ============================================
// LOCATION TYPES
// ============================================

export interface LocationUpdate {
  id: string;
  service_request_id: string;
  locksmith_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  created_at: Date;
}

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
}

// ============================================
// CHAT TYPES
// ============================================

export interface Message {
  id: string;
  service_request_id: string;
  sender_id: string;
  content: string;
  is_deleted_for_customer: boolean;
  is_deleted_for_locksmith: boolean;
  created_at: Date;
}

export interface SendMessageRequest {
  content: string;
}

// ============================================
// PRICING TYPES
// ============================================

export interface PricingRule {
  id: string;
  name: string;
  service_id?: string;
  base_price: number;
  distance_multiplier: number;
  time_of_day_multiplier: number;
  weather_multiplier: number;
  urgency_multiplier: number;
  active_from: Date;
  active_until?: Date;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PriceQuoteRequest {
  service_id: string;
  latitude: number;
  longitude: number;
  locksmith_latitude?: number;
  locksmith_longitude?: number;
}

export interface PriceQuoteResponse {
  base_price: number;
  distance_multiplier: number;
  additional_fees: number;
  platform_fee: number;
  total: number;
  locksmith_amount: number;
  estimated_time_minutes?: number;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  category?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleKeyOption {
  id: string;
  vehicle_id: string;
  key_type: string; // simples, canivete_original, etc
  price_manual?: number;
  available: boolean;
  created_by: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface RequestUser {
  id: string;
  type: UserType;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
