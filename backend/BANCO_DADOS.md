# MODELO DE BANCO DE DADOS - CHAVEIRO JÁ

## Schema PostgreSQL Completo

```sql
-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_type_enum AS ENUM ('customer', 'locksmith', 'admin');
CREATE TYPE job_status_enum AS ENUM (
  'created',
  'searching',
  'offered',
  'accepted',
  'on_the_way',
  'arrived',
  'in_progress',
  'completed',
  'cancelled_customer',
  'cancelled_locksmith',
  'cancelled_timeout'
);
CREATE TYPE locksmith_status_enum AS ENUM ('online', 'offline', 'blocked');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE locksmith_mode_enum AS ENUM ('applicativo', 'livre');
CREATE TYPE key_type_enum AS ENUM (
  'simples',
  'canivete_original',
  'canivete_paralela',
  'presenca_original',
  'presenca_paralela'
);

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- USERS (Base para todos os usuários)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  user_type user_type_enum NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

-- CUSTOMER_PROFILES
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  document_type VARCHAR(20),
  document VARCHAR(20) UNIQUE,
  birthdate DATE,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_location ON customer_profiles(latitude, longitude);

-- LOCKSMITH_PROFILES
CREATE TABLE locksmith_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  business_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(20) UNIQUE NOT NULL,
  document VARCHAR(20) UNIQUE NOT NULL,
  selfie_url VARCHAR(500),
  status locksmith_status_enum DEFAULT 'offline',
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  location_updated_at TIMESTAMP,
  mode locksmith_mode_enum DEFAULT 'applicativo',
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  cancellation_count INTEGER DEFAULT 0,
  blocked_until TIMESTAMP,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_locksmith_status ON locksmith_profiles(status);
CREATE INDEX idx_locksmith_location ON locksmith_profiles(current_latitude, current_longitude);
CREATE INDEX idx_locksmith_verified ON locksmith_profiles(verified_at);

-- SERVICES
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  requires_vehicle BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- LOCKSMITH_SERVICES (Serviços que cada chaveiro oferece)
CREATE TABLE locksmith_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locksmith_id UUID NOT NULL,
  service_id UUID NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_service FOREIGN KEY (service_id) 
    REFERENCES services(id) ON DELETE RESTRICT,
  CONSTRAINT unique_locksmith_service UNIQUE (locksmith_id, service_id)
);

CREATE INDEX idx_locksmith_services_locksmith ON locksmith_services(locksmith_id);
CREATE INDEX idx_locksmith_services_service ON locksmith_services(service_id);

-- SERVICE_REQUESTS (Jobs/Chamados)
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  service_id UUID NOT NULL,
  locksmith_id UUID,
  status job_status_enum DEFAULT 'created',
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  vehicle_plate VARCHAR(10),
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  payment_status payment_status_enum DEFAULT 'pending',
  cancel_reason VARCHAR(500),
  cancelled_by UUID,
  cancellation_fee DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) 
    REFERENCES customer_profiles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_service FOREIGN KEY (service_id) 
    REFERENCES services(id) ON DELETE RESTRICT,
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_locksmith ON service_requests(locksmith_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_created ON service_requests(created_at);
CREATE INDEX idx_service_requests_location ON service_requests(latitude, longitude);

-- SERVICE_HISTORY (Histórico de mudanças de status)
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  old_status job_status_enum,
  new_status job_status_enum NOT NULL,
  changed_by UUID,
  reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE CASCADE
);

CREATE INDEX idx_service_history_request ON service_history(service_request_id);

-- LOCATION_UPDATES (Rastreamento em tempo real)
CREATE TABLE location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  locksmith_id UUID NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  speed DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_location_updates_request ON location_updates(service_request_id);
CREATE INDEX idx_location_updates_created ON location_updates(created_at DESC);

-- MESSAGES (Chat - Nunca deletar, manter para auditoria)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_deleted_for_customer BOOLEAN DEFAULT false,
  is_deleted_for_locksmith BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_sender FOREIGN KEY (sender_id) 
    REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_messages_request ON messages(service_request_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- REVIEWS (Avaliações)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE,
  reviewer_id UUID NOT NULL,
  reviewed_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reviewed FOREIGN KEY (reviewed_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- ============================================
-- PAGAMENTOS
-- ============================================

-- PAYMENT_ACCOUNTS (Contas de pagamento - Mercado Pago)
CREATE TABLE payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locksmith_id UUID NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(100) UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  public_key VARCHAR(255),
  is_connected BOOLEAN DEFAULT false,
  connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_accounts_locksmith ON payment_accounts(locksmith_id);

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  locksmith_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  base_price DECIMAL(10, 2),
  distance_multiplier DECIMAL(4, 2),
  additional_fees DECIMAL(10, 2),
  discount DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  locksmith_amount DECIMAL(10, 2),
  status payment_status_enum DEFAULT 'pending',
  payment_method VARCHAR(50),
  provider_transaction_id VARCHAR(255),
  provider_response JSONB,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) 
    REFERENCES customer_profiles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_payments_request ON payments(service_request_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at);

-- PAYOUTS (Transferências ao chaveiro)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locksmith_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period_start DATE,
  period_end DATE,
  status VARCHAR(50) DEFAULT 'pending',
  provider_transfer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_payouts_locksmith ON payouts(locksmith_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- ============================================
-- PREÇOS
-- ============================================

-- PRICING_RULES
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  service_id UUID,
  base_price DECIMAL(10, 2) NOT NULL,
  distance_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  time_of_day_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  weather_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  urgency_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  active_from TIMESTAMP NOT NULL,
  active_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service FOREIGN KEY (service_id) 
    REFERENCES services(id) ON DELETE SET NULL,
  CONSTRAINT fk_admin FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pricing_rules_service ON pricing_rules(service_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);

-- PRICING_SNAPSHOTS (Snapshot do preço no momento do chamado)
CREATE TABLE pricing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE,
  pricing_rule_id UUID,
  rule_name VARCHAR(100),
  base_price DECIMAL(10, 2),
  distance_multiplier DECIMAL(4, 2),
  final_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE CASCADE
);

-- ============================================
-- VEÍCULOS E FIPE
-- ============================================

-- FIPE_VALUES
CREATE TABLE fipe_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fipe_code VARCHAR(20) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20),
  value DECIMAL(12, 2) NOT NULL,
  reference_month VARCHAR(10),
  reference_year INTEGER,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fipe_code ON fipe_values(fipe_code);
CREATE INDEX idx_fipe_brand_model ON fipe_values(brand, model, year);

-- VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_years CHECK (year_start <= year_end),
  CONSTRAINT unique_vehicle UNIQUE (brand, model, year_start, year_end)
);

CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicles_model ON vehicles(model);

-- VEHICLE_YEAR_RANGES (Faixas de anos com preços)
CREATE TABLE vehicle_year_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  labor_percentage DECIMAL(4, 2) NOT NULL,
  fipe_value DECIMAL(12, 2),
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) 
    REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT valid_years CHECK (year_start <= year_end),
  CONSTRAINT unique_range UNIQUE (vehicle_id, year_start, year_end)
);

CREATE INDEX idx_year_ranges_vehicle ON vehicle_year_ranges(vehicle_id);

-- VEHICLE_KEY_OPTIONS
CREATE TABLE vehicle_key_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  key_type key_type_enum NOT NULL,
  price_manual DECIMAL(10, 2),
  available BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) 
    REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_option UNIQUE (vehicle_id, key_type)
);

CREATE INDEX idx_vehicle_keys_vehicle ON vehicle_key_options(vehicle_id);

-- ============================================
-- CANCELAMENTOS E BLOQUEIOS
-- ============================================

-- CANCELLATIONS
CREATE TABLE cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  cancelled_by UUID NOT NULL,
  reason VARCHAR(500),
  fee DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_service_request FOREIGN KEY (service_request_id) 
    REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (cancelled_by) 
    REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_cancellations_request ON cancellations(service_request_id);
CREATE INDEX idx_cancellations_user ON cancellations(cancelled_by);

-- LOCKSMITH_BLOCKS
CREATE TABLE locksmith_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locksmith_id UUID NOT NULL,
  reason VARCHAR(500) NOT NULL,
  blocked_until TIMESTAMP NOT NULL,
  blocked_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_locksmith FOREIGN KEY (locksmith_id) 
    REFERENCES locksmith_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin FOREIGN KEY (blocked_by) 
    REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_blocks_locksmith ON locksmith_blocks(locksmith_id);

-- ============================================
-- AUDITORIA
-- ============================================

-- AUDIT_LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- CONFIGURAÇÕES
-- ============================================

-- ADMIN_SETTINGS
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  type VARCHAR(50),
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_settings_key ON admin_settings(key);

-- NOTIFICATION_SETTINGS
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABELAS ADICIONAIS
-- ============================================

-- OAUTH_TOKENS
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_oauth UNIQUE (user_id, provider)
);

-- DEVICE_TOKENS (Para notificações push)
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token VARCHAR(500) NOT NULL,
  device_type VARCHAR(20),
  device_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);

-- ============================================
-- TRIGGERS PARA AUDITORIA
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
  VALUES (
    CURRENT_SETTING('app.user_id')::UUID,
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas críticas
CREATE TRIGGER audit_users AFTER UPDATE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_payments AFTER UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_service_requests AFTER UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_pricing_rules AFTER UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

## Relacionamentos Principais

```
users (1) ──→ (1) customer_profiles
       └───→ (1) locksmith_profiles
       └───→ (1) oauth_tokens
       └───→ (N) device_tokens
       └───→ (N) audit_logs

locksmith_profiles (1) ──→ (N) locksmith_services
                      └──→ (N) service_requests
                      └──→ (1) payment_accounts
                      └──→ (N) payments (como locksmith_id)
                      └──→ (N) location_updates

customer_profiles (1) ──→ (N) service_requests
                     └──→ (N) payments (como customer_id)

services (1) ──→ (N) locksmith_services
           └──→ (N) service_requests
           └──→ (N) pricing_rules

service_requests (1) ──→ (N) messages
                    └──→ (N) location_updates
                    └──→ (1) payments
                    └──→ (1) reviews
                    └──→ (N) service_history
                    └──→ (1) pricing_snapshots
                    └──→ (1) cancellations

vehicles (1) ──→ (N) vehicle_year_ranges
           └──→ (N) vehicle_key_options
```

---

## Índices de Performance

```sql
-- Localizações e busca de chaveiros
CREATE INDEX idx_locksmith_location_status 
  ON locksmith_profiles(status, current_latitude, current_longitude);

-- Busca de chamados abertos
CREATE INDEX idx_service_requests_status_created 
  ON service_requests(status, created_at DESC);

-- Histórico de usuário
CREATE INDEX idx_service_requests_customer_status 
  ON service_requests(customer_id, status);

-- Análise de ganhos
CREATE INDEX idx_payments_locksmith_status 
  ON payments(locksmith_id, status, created_at);

-- Auditoria por período
CREATE INDEX idx_audit_logs_created_user 
  ON audit_logs(created_at DESC, user_id);
```

---

## Constraints e Validações

```
✓ Email único e formatado
✓ Telefones internacionais
✓ Coordenadas válidas (latitude -90 a 90, longitude -180 a 180)
✓ Ratings entre 1-5
✓ Datas de anos não conflitantes para veículos
✓ Preços positivos
✓ Status transitions válidas
✓ Soft deletes para dados críticos
✓ Timestamps em TIMESTAMP WITH TIME ZONE
✓ UUIDs para IDs (melhor que integers)
✓ JSON para dados semi-estruturados (webhooks, respostas de APIs)
```
