# PLANO DE IMPLEMENTAÇÃO - CHAVEIRO JÁ

## FASE 1: SETUP E INFRAESTRUTURA (1-2 dias)

### Semana 1
- [ ] Criar repositório Git
- [ ] Configurar Node.js + TypeScript
- [ ] Instalar e configurar PostgreSQL
- [ ] Configurar variáveis de ambiente
- [ ] Criar estrutura de pastas
- [ ] Setup de desenvolvimento local

### Dependências Principais
```json
{
  "express": "^4.18.2",
  "postgresql": "^14.0",
  "drizzle-orm": "^0.29.0",
  "jsonwebtoken": "^9.1.0",
  "bcryptjs": "^2.4.3",
  "socket.io": "^4.6.0",
  "axios": "^1.6.0",
  "zod": "^3.22.0",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

---

## FASE 2: BANCO DE DADOS (1 dia)

- [ ] Executar schema SQL completo
- [ ] Criar índices
- [ ] Criar triggers de auditoria
- [ ] Seed dados de teste
- [ ] Validar constraints

**Comando:**
```bash
psql -U usuario -d chaveiroja -f BANCO_DADOS.md
npm run migrate
npm run seed
```

---

## FASE 3: AUTENTICAÇÃO (2-3 dias)

### Backend
- [ ] Modelo User
- [ ] Hash de senhas (bcryptjs)
- [ ] Geração JWT
- [ ] Refresh tokens
- [ ] Google OAuth setup
- [ ] OAuth callback handler
- [ ] Deep link para mobile
- [ ] Logout com revoke de token

### Endpoints
```
POST   /auth/register
POST   /auth/login
POST   /auth/google/callback
POST   /auth/refresh-token
POST   /auth/logout
GET    /auth/verify
```

### Testes
- [ ] Registrar novo usuário
- [ ] Login com email/senha
- [ ] Login com Google (callback)
- [ ] Refresh token expirado
- [ ] Logout revoga sessão
- [ ] Token inválido retorna 401

---

## FASE 4: PERFIS DE USUÁRIO (2 dias)

### Backend
- [ ] Customer profile (CRUD)
- [ ] Locksmith profile (CRUD)
- [ ] Validação de documentos
- [ ] Foto/selfie upload
- [ ] Conclusão de perfil
- [ ] Validações de CPF/documento

### Endpoints
```
GET    /customers/me
PUT    /customers/me
POST   /customers/complete-profile

GET    /locksmiths/me
PUT    /locksmiths/me
POST   /locksmiths/documents/upload
```

---

## FASE 5: SISTEMA DE SERVIÇOS (1 dia)

### Backend
- [ ] Modelo Service
- [ ] CRUD de serviços
- [ ] Serviços que o chaveiro oferece
- [ ] Filtros e buscas

### Endpoints
```
GET    /services
GET    /services/:id
POST   /services (admin)
PUT    /services/:id (admin)
```

---

## FASE 6: SISTEMA DE PREÇOS (2 dias)

### Backend
- [ ] Modelo Vehicle
- [ ] Modelo Vehicle Year Range
- [ ] Modelo Vehicle Key Option
- [ ] Integração FIPE
- [ ] Cálculo de preço automotivo
- [ ] Pricing Rules
- [ ] Histórico de preços

### Endpoints
```
GET    /admin/vehicles
POST   /admin/vehicles
PUT    /admin/vehicles/:id
GET    /admin/vehicles/:id/keys
PUT    /admin/vehicles/:id/keys

GET    /admin/pricing-rules
POST   /admin/pricing-rules
PUT    /admin/pricing-rules/:id

GET    /price-quote
  (calcula preço estimado)
```

### Cálculo de Preço
```
MODO APLICATIVO:
  Preço Base
  + (Distância × Multiplicador)
  + Taxas adicionais
  + Taxas de horário/clima
  - Descontos
  = Subtotal
  × (1 - Taxa Plataforma 15%)
  = Valor para o Chaveiro
```

---

## FASE 7: SISTEMA DE JOBS/CHAMADOS (3-4 dias)

### Backend
- [ ] Modelo ServiceRequest
- [ ] Status transitions (máquina de estados)
- [ ] Criação de chamado
- [ ] Busca de chaveiros próximos
- [ ] Oferta para múltiplos chaveiros
- [ ] Aceite (com idempotência)
- [ ] Atualização de status
- [ ] Cancelamento com taxa
- [ ] Histórico de status

### Endpoints
```
POST   /jobs
GET    /jobs
GET    /jobs/:id
PUT    /jobs/:id/accept
PUT    /jobs/:id/start
PUT    /jobs/:id/complete
PUT    /jobs/:id/cancel
GET    /jobs/:id/offers
```

### Busca de Chaveiros
```javascript
SELECT DISTINCT c.* FROM locksmith_profiles c
JOIN locksmith_services s ON c.id = s.locksmith_id
WHERE 
  c.status = 'online'
  AND c.verified_at IS NOT NULL
  AND s.service_id = ?
  AND (c.current_latitude IS NOT NULL)
  AND ST_Distance_Sphere(
    ST_Point(c.current_longitude, c.current_latitude),
    ST_Point(?, ?)
  ) < 5000 -- 5km
  AND c.blocked_until IS NULL
  AND c.cancellation_count < 3
ORDER BY ST_Distance_Sphere(...) ASC
LIMIT 10;
```

---

## FASE 8: LOCALIZAÇÃO E RASTREAMENTO (2-3 dias)

### Backend
- [ ] Atualização de localização
- [ ] Validação de coordenadas
- [ ] Histórico de localização
- [ ] Cálculo de distância
- [ ] Cálculo de ETA
- [ ] Integração Google Maps

### Endpoints
```
POST   /location/update
GET    /jobs/:id/location
GET    /jobs/:id/eta
```

### Validações
```javascript
// GPS apenas para chaveiro em chamado ativo
if (locksmith.status !== 'online' || !jobId) {
  throw new Error('Não autorizado');
}

// Validar coordenadas
if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  throw new Error('Coordenadas inválidas');
}

// Não permitir teleporte
const previousLocation = await getLastLocation(locksmithId);
const distance = calculateDistance(previousLocation, currentLocation);
if (distance > 50) { // 50km em 1 minuto = teleporte
  throw new Error('Movimento inválido');
}
```

---

## FASE 9: CHAT EM TEMPO REAL (2-3 dias)

### Backend
- [ ] Modelo Message
- [ ] Socket.io setup
- [ ] Envio de mensagens
- [ ] Recebimento em tempo real
- [ ] Soft delete de conversa
- [ ] Histórico preservado (auditoria)

### Endpoints
```
POST   /chat/:job_id/messages
GET    /chat/:job_id/messages
PUT    /chat/:job_id/delete (soft delete)
```

### WebSocket Events
```javascript
socket.on('message:send', (data) => {
  // Validar job_id e usuário
  // Salvar mensagem
  // Emitir para outro usuário
});

socket.on('chat:delete', (jobId) => {
  // Soft delete (apenas oculta para este usuário)
});

socket.on('typing', (jobId) => {
  // Emitir "usuário está digitando..."
});
```

---

## FASE 10: PAGAMENTOS (3-4 dias)

### Backend
- [ ] Integração Mercado Pago OAuth
- [ ] Conexão de conta de pagamento
- [ ] Criação de pagamento
- [ ] Webhook de confirmação
- [ ] Validação de idempotência
- [ ] Histórico de pagamentos
- [ ] Cálculo de repasse

### Endpoints
```
POST   /payments/mercado-pago/connect
GET    /payments/mercado-pago/callback
POST   /payments/:job_id
GET    /payments/:job_id
POST   /webhooks/mercado-pago
GET    /admin/payouts
```

### Segurança
```javascript
// Nunca confiar em user_id ou valor do frontend
const payment = await createPayment({
  jobId,          // Do banco, não do frontend
  customerId,     // Validado do JWT
  locksmithId,    // Do banco
  amount,         // Calculado no backend
  serviceFee: calculateFee(amount),
  locksmithAmount: amount - fee
});
```

---

## FASE 11: AVALIAÇÕES (1-2 dias)

### Backend
- [ ] Modelo Review
- [ ] Criação de avaliação
- [ ] Atualização de rating do locksmith
- [ ] Evitar duplicatas
- [ ] Mostrar apenas após conclusão

### Endpoints
```
POST   /reviews/:job_id
GET    /reviews/:user_id
```

---

## FASE 12: PAINEL ADMINISTRATIVO (3-4 dias)

### Backend
- [ ] CRUD de clientes
- [ ] CRUD de chaveiros
- [ ] Verificação de documentos
- [ ] CRUD de serviços
- [ ] CRUD de preços
- [ ] CRUD de veículos
- [ ] Relatórios
- [ ] Auditoria
- [ ] Configurações

### Endpoints
```
GET    /admin/dashboard
GET    /admin/customers
GET    /admin/locksmiths
GET    /admin/jobs
GET    /admin/payments
GET    /admin/analytics
PUT    /admin/settings
```

---

## FASE 13: NOTIFICAÇÕES PUSH (2-3 dias)

### Backend
- [ ] Firebase setup
- [ ] Registro de device tokens
- [ ] Envio de notificações
- [ ] Notificações de chamado
- [ ] Notificações de status

### Endpoints
```
POST   /notifications/device-token
POST   /notifications/send (admin)
```

---

## FASE 14: TESTES E SEGURANÇA (3-5 dias)

### Unit Tests
- [ ] Auth service
- [ ] Price calculations
- [ ] Validators
- [ ] Helpers

### Integration Tests
- [ ] Auth flows
- [ ] Job creation
- [ ] Payment processing
- [ ] Real-time features

### Security Tests
- [ ] IDOR prevention
- [ ] Authorization checks
- [ ] SQL injection
- [ ] XSS/CSRF
- [ ] Rate limiting

---

## FASE 15: MOBILE APP (5-7 dias)

### Customer App
- [ ] Login
- [ ] Home
- [ ] Search/Create job
- [ ] Tracking
- [ ] Chat
- [ ] History
- [ ] Profile
- [ ] Push notifications

### Locksmith App
- [ ] Login
- [ ] Jobs list
- [ ] Job details
- [ ] Accept/Decline
- [ ] Location tracking
- [ ] Chat
- [ ] Earnings
- [ ] Push notifications

---

## FASE 16: ADMIN PANEL (3-4 dias)

- [ ] Dashboard
- [ ] Customer management
- [ ] Locksmith verification
- [ ] Job monitoring
- [ ] Payment management
- [ ] Pricing configuration
- [ ] Reports
- [ ] Analytics

---

## FASE 17: DEPLOYMENT E PRODUÇÃO (2-3 dias)

- [ ] Setup servidor (Railway, AWS, etc)
- [ ] Database backup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring e alertas
- [ ] Logging centralizado
- [ ] SSL/HTTPS
- [ ] Rate limiting
- [ ] Plano de disaster recovery

---

## TIMELINE ESTIMADA

```
Fase 1:  Setup                    1-2 dias
Fase 2:  Banco de dados           1 dia
Fase 3:  Autenticação             2-3 dias
Fase 4:  Perfis                   2 dias
Fase 5:  Serviços                 1 dia
Fase 6:  Preços                   2 dias
Fase 7:  Jobs/Chamados            3-4 dias
Fase 8:  Localização              2-3 dias
Fase 9:  Chat                     2-3 dias
Fase 10: Pagamentos               3-4 dias
Fase 11: Avaliações               1-2 dias
Fase 12: Admin panel backend      3-4 dias
Fase 13: Notificações             2-3 dias
Fase 14: Testes                   3-5 dias
Fase 15: Mobile app               5-7 dias
Fase 16: Admin panel UI           3-4 dias
Fase 17: Deploy                   2-3 dias
         ───────────────────────
         TOTAL: 40-60 dias
```

---

## PRÓXIMAS AÇÕES

1. ✅ Arquitetura definida
2. ✅ Banco de dados projetado
3. ✅ Permissões mapeadas
4. ⏭️ Começar FASE 1 (Setup)
5. ⏭️ Começar FASE 2 (Banco)
6. ⏭️ Começar FASE 3 (Auth)

---

## CREDENCIAIS NECESSÁRIAS

Você precisa fornecer:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MERCADO_PAGO_CLIENT_ID=
MERCADO_PAGO_CLIENT_SECRET=

GOOGLE_MAPS_API_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

JWT_SECRET= (gerado automaticamente)
DATABASE_URL= (PostgreSQL local/remote)
```

**Você já tem essas credenciais?**
