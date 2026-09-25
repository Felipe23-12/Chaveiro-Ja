# ARQUITETURA - CHAVEIRO JÁ

## 1. VISÃO GERAL DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                     CHAVEIRO JÁ - MARKETPLACE              │
│              Plataforma de Serviços de Chaveiro             │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Cliente   │         │   Chaveiro   │         │ Administrador
│   Mobile    │         │   Mobile     │         │   Web Panel
│  (iOS/Droid)│         │ (iOS/Droid)  │         │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       └───────────────────────┴────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Gateway       │
                    │   (Node.js/Express) │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────▼──────┐        ┌──────▼────────┐      ┌──────▼────────┐
│  Auth       │        │  Core API     │      │  Real-time    │
│  Service    │        │  Service      │      │  Service      │
└──────┬──────┘        └──────┬────────┘      └──────┬────────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   PostgreSQL DB    │
                    │   (Data Layer)     │
                    └────────────────────┘
                    
       ┌────────────────────────────────────────┐
       │      External Services Integration     │
       ├────────────────────────────────────────┤
       │ • Google OAuth                         │
       │ • Mercado Pago (Payments)              │
       │ • Google Maps (Geolocation)            │
       │ • Firebase Cloud Messaging (Push)      │
       │ • FIPE Database                        │
       └────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICO

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Banco**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Real-time**: Socket.io (WebSocket)
- **Auth**: JWT + OAuth2
- **Validação**: Zod/Joi
- **API Docs**: Swagger/OpenAPI

### Frontend - Cliente & Chaveiro
- **Framework**: React Native
- **Build**: Expo / EAS Build
- **State**: Redux Toolkit / Zustand
- **API Client**: Axios
- **Mapas**: React Native Maps / Expo Maps
- **Real-time**: Socket.io-client
- **Auth**: Expo AuthSession

### Frontend - Admin
- **Framework**: React 18
- **UI**: Material-UI / Shadcn
- **State**: React Query + Redux
- **Charts**: Recharts / Chart.js
- **Auth**: NextAuth / Custom JWT

---

## 3. ESTRUTURA DE PASTAS

```
chaveiroja/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimit.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── customers.routes.ts
│   │   │   ├── locksmiths.routes.ts
│   │   │   ├── services.routes.ts
│   │   │   ├── jobs.routes.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── customerController.ts
│   │   │   ├── locksmithController.ts
│   │   │   ├── serviceController.ts
│   │   │   ├── jobController.ts
│   │   │   ├── paymentController.ts
│   │   │   └── chatController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── jobService.ts
│   │   │   ├── pricingService.ts
│   │   │   ├── locationService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── paymentService.ts
│   │   │   └── searchService.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers.ts
│   │   ├── config/
│   │   │   └── environment.ts
│   │   └── index.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── security/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── SignUpScreen.tsx
│   │   │   │   └── GoogleLoginScreen.tsx
│   │   │   ├── customer/
│   │   │   │   ├── HomeScreen.tsx
│   │   │   │   ├── SearchScreen.tsx
│   │   │   │   ├── JobDetailScreen.tsx
│   │   │   │   ├── TrackingScreen.tsx
│   │   │   │   ├── ChatScreen.tsx
│   │   │   │   ├── HistoryScreen.tsx
│   │   │   │   └── ProfileScreen.tsx
│   │   │   └── locksmith/
│   │   │       ├── HomeScreen.tsx
│   │   │       ├── JobsScreen.tsx
│   │   │       ├── JobDetailScreen.tsx
│   │   │       ├── ChatScreen.tsx
│   │   │       ├── EarningsScreen.tsx
│   │   │       └── ProfileScreen.tsx
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   ├── navigation/
│   │   └── utils/
│   └── app.json
│
├── admin/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── locksmiths/
│   │   │   ├── jobs/
│   │   │   ├── services/
│   │   │   ├── pricing/
│   │   │   ├── vehicles/
│   │   │   ├── payments/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── docs/
    ├── API.md
    ├── DATABASE.md
    ├── AUTH.md
    ├── PAYMENTS.md
    ├── SECURITY.md
    └── DEPLOYMENT.md
```

---

## 4. FLUXOS PRINCIPAIS

### Fluxo 1: Login Cliente
```
1. Tela de boas-vindas
2. Escolhe "SOU CLIENTE"
3. Oferece: Email/Senha, Google, Cadastre-se
4. Se Google:
   - Abre WebView/navegador
   - Usuário autoriza
   - Retorna ao app via deep link
   - Cria/recupera sessão
5. Se Email/Senha:
   - Valida credenciais no backend
   - Retorna JWT + Refresh Token
6. App carrega dados do usuário
7. Direciona para Home Cliente
```

### Fluxo 2: Chamar Chaveiro
```
1. Cliente em Home
2. Clica em serviço (Abertura Automotiva)
3. Preenche dados:
   - Endereço
   - Descrição
   - Placa do veículo
4. Backend busca chaveiros:
   - Online = true
   - Serviço compatível
   - Próximos (distância)
   - Disponíveis
5. Exibe preço (Modo Aplicativo)
6. Cliente confirma
7. Notificações enviadas aos chaveiros
8. Transição: PROCURANDO_CHAVEIRO
9. Primeiro a aceitar vence
10. Chat inicia
11. Rastreamento em tempo real
```

### Fluxo 3: Aceitar e Atender
```
1. Chaveiro recebe notificação
2. Vê detalhes do chamado
3. Clica "ACEITAR"
4. Backend valida (idempotência)
5. Outros chaveiros veem "Chamado indisponível"
6. Cliente vê "Chaveiro aceito - a caminho"
7. Mapa exibe rota e localização do chaveiro
8. Chat disponível
9. Chaveiro chega
10. Transição: CHEGOU
11. Inicia atendimento
12. Conclui
13. Pagamento
14. Avaliações
```

---

## 5. ENTIDADES PRINCIPAIS

```
USERS
├── id (UUID)
├── email
├── password_hash
├── first_name
├── last_name
├── phone
├── user_type (customer | locksmith | admin)
├── is_active
├── created_at
└── updated_at

CUSTOMER_PROFILES
├── id
├── user_id (FK)
├── address
├── city
├── state
├── postal_code
├── latitude
├── longitude
├── document_type
├── document
├── birthdate
├── profile_complete
└── preferences

LOCKSMITH_PROFILES
├── id
├── user_id (FK)
├── business_name
├── cpf
├── document
├── selfie_url
├── status (online | offline | blocked)
├── current_latitude
├── current_longitude
├── location_updated_at
├── mode (applicativo | livre)
├── rating
├── review_count
├── total_jobs
├── cancellation_count
├── blocked_until
└── verified_at

LOCKSMITH_SERVICES
├── id
├── locksmith_id (FK)
├── service_id (FK)
└── available (boolean)

SERVICES
├── id
├── name
├── category
├── description
├── icon
├── is_active
└── requires_vehicle (boolean)

SERVICE_REQUESTS (JOBS)
├── id
├── customer_id (FK)
├── service_id (FK)
├── locksmith_id (FK nullable)
├── status (pending | assigned | in_progress | completed | cancelled)
├── address
├── latitude
├── longitude
├── description
├── vehicle_plate
├── estimated_price
├── final_price
├── payment_status
├── created_at
└── updated_at

PAYMENTS
├── id
├── job_id (FK)
├── customer_id (FK)
├── locksmith_id (FK)
├── amount
├── status (pending | completed | refunded)
├── payment_method
├── provider_transaction_id
├── created_at
└── updated_at

REVIEWS
├── id
├── job_id (FK)
├── reviewer_id (FK)
├── reviewed_id (FK)
├── rating (1-5)
├── comment
├── created_at
└── updated_at

MESSAGES
├── id
├── job_id (FK)
├── sender_id (FK)
├── content
├── created_at
└── never delete (auditoria)

PRICING_RULES
├── id
├── name
├── service_id (FK nullable)
├── base_price
├── distance_multiplier
├── time_of_day_rules
├── weather_rules
├── urgency_rules
├── active_from
├── active_until
└── created_by (admin_id)

VEHICLES
├── id
├── brand
├── model
├── year_start
├── year_end
├── fipe_code
├── current_fipe_value
└── fipe_updated_at

VEHICLE_KEY_OPTIONS
├── id
├── vehicle_id (FK)
├── key_type (simples | canivete_original | canivete_paralela | presenca_original | presenca_paralela)
├── price_manual
├── available
├── created_by (admin_id)
└── updated_by (admin_id)

AUDIT_LOGS
├── id
├── user_id (FK)
├── action
├── entity_type
├── entity_id
├── changes (JSON)
├── created_at
└── never delete
```

---

## 6. MÁQUINA DE ESTADOS DO JOB

```
                    [CRIADO]
                       │
                       ▼
            ┌─────────────────────┐
            │  PROCURANDO_CHAVEIRO│
            └──────────┬──────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      [ACEITO]  [ENVIADO]  [CANCELADO_CLIENTE]
          │            │
          │            ▼
          │       (timeout)
          │            │
          │            ▼
          │     [CANCELADO_TIMEOUT]
          │
          ▼
      [A_CAMINHO]
          │
          ▼
      [CHEGOU]
          │
          ▼
      [EM_ANDAMENTO]
          │
    ┌─────┴─────┐
    ▼           ▼
[CONCLUÍDO] [CANCELADO_LOCKSMITH]
    │
    ▼
[PAGAMENTO_PENDENTE]
    │
    ├─→ [PAGAMENTO_CONCLUÍDO]
    │
    └─→ [PAGAMENTO_FALHOU]
```

---

## 7. ENDPOINTS PRINCIPAIS DA API

```
AUTH
POST   /auth/register
POST   /auth/login
POST   /auth/google/callback
POST   /auth/refresh-token
POST   /auth/logout

CUSTOMER
GET    /customers/me
PUT    /customers/me
POST   /customers/complete-profile
GET    /customers/profile

LOCKSMITH
GET    /locksmiths/me
PUT    /locksmiths/me
POST   /locksmiths/connect-mercado-pago
GET    /locksmiths/earnings
PUT    /locksmiths/status

SERVICE
GET    /services
GET    /services/:id

JOB (SERVICE REQUEST)
POST   /jobs
GET    /jobs
GET    /jobs/:id
PUT    /jobs/:id/accept
PUT    /jobs/:id/start
PUT    /jobs/:id/complete
PUT    /jobs/:id/cancel
PUT    /jobs/:id/rate

LOCATION
POST   /location/update
GET    /location/:job_id

CHAT
POST   /chat/:job_id/messages
GET    /chat/:job_id/messages
PUT    /chat/:job_id/delete-conversation

PAYMENT
POST   /payments/:job_id
GET    /payments/:job_id
POST   /payments/webhook/mercado-pago

ADMIN
GET    /admin/dashboard
GET    /admin/customers
GET    /admin/locksmiths
GET    /admin/jobs
PUT    /admin/pricing-rules
PUT    /admin/vehicles
PUT    /admin/settings
```

---

## 8. VARIÁVEIS DE AMBIENTE

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chaveiroja

# Auth
JWT_SECRET=your_jwt_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# Mercado Pago
MERCADO_PAGO_CLIENT_ID=your_mp_client_id
MERCADO_PAGO_CLIENT_SECRET=your_mp_client_secret
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret

# Maps
GOOGLE_MAPS_API_KEY=your_maps_key
GOOGLE_MAPS_SECRET=your_maps_secret

# Firebase Push
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Redis (Real-time)
REDIS_URL=redis://localhost:6379

# App Config
NODE_ENV=development|production
PORT=3000
LOG_LEVEL=info

# Admin Panel
ADMIN_SECRET=strong_admin_secret
```

---

## 9. FLUXO DE SEGURANÇA

```
CLIENTE/CHAVEIRO AUTENTICADO
         │
         ▼
   Validar JWT
         │
    ┌────┴────┐
    ▼         ▼
  Válido   Expirado
    │         │
    │         ▼
    │     Usar Refresh Token
    │         │
    │    ┌────┴────┐
    │    ▼         ▼
    │  Válido    Inválido
    │    │         │
    │    ▼         ▼
    │   Novo   Fazer login
    │   JWT    novamente
    │    │
    └────┴─────────┐
                   ▼
            Validar permissão
                   │
          ┌────────┴────────┐
          ▼                 ▼
      Permitido         Negado
          │               │
          ▼               ▼
      Executar      Erro 403
      Operação      Forbidden
          │
          ▼
    Registrar auditoria
          │
          ▼
    Responder
```

---

## 10. ESTRATÉGIA DE TESTES

```
Unit Tests (60%)
├── Utils
├── Validators
├── Price calculations
└── Auth logic

Integration Tests (30%)
├── Auth flows
├── Job creation & acceptance
├── Payment processing
├── Real-time features
└── Database operations

Security Tests (10%)
├── IDOR prevention
├── Authorization checks
├── SQL injection
├── XSS/CSRF
└── Rate limiting
```

---

## 11. PRÓXIMOS PASSOS

1. ✅ Criar modelo do banco de dados
2. ✅ Criar matriz de permissões
3. ✅ Configurar projeto Node.js
4. ✅ Criar migrations do banco
5. ✅ Implementar autenticação
6. ✅ Criar CRUD de usuários
7. ✅ Implementar sistema de jobs
8. ✅ Integração Mercado Pago
9. ✅ Real-time com Socket.io
10. ✅ Mobile app (React Native)
11. ✅ Admin panel
12. ✅ Testes completos
13. ✅ Deploy
