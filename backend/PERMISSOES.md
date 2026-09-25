# MATRIZ DE PERMISSÕES E SEGURANÇA - CHAVEIRO JÁ

## 1. MATRIZ DE CONTROLE DE ACESSO (ACL)

### CLIENTE

| Operação | Permitido | Validações |
|----------|-----------|-----------|
| Ver seu próprio perfil | ✅ | Autenticado |
| Editar seu próprio perfil | ✅ | Autenticado, proprietário |
| Ver suas solicitações | ✅ | Autenticado |
| Criar solicitação de serviço | ✅ | Autenticado, perfil completo |
| Cancelar sua solicitação | ✅ | Autenticado, proprietário, não concluída |
| Ver localização do chaveiro | ✅ | Autenticado, proprietário do chamado, em andamento |
| Enviar mensagens | ✅ | Autenticado, em chamado ativo |
| Deletar conversa (soft delete) | ✅ | Autenticado, proprietário |
| Avaliar chaveiro | ✅ | Autenticado, chamado concluído, primeira vez |
| Ver pagamentos | ✅ | Autenticado, proprietário |
| Ver histórico | ✅ | Autenticado |
| --- | --- | --- |
| Ver outros clientes | ❌ | NUNCA |
| Editar outro cliente | ❌ | NUNCA |
| Ver dados privados de chaveiro | ❌ | NUNCA (apenas público) |
| Acessar painel administrativo | ❌ | NUNCA |
| Gerar relatórios | ❌ | NUNCA |

### CHAVEIRO

| Operação | Permitido | Validações |
|----------|-----------|-----------|
| Ver seu próprio perfil | ✅ | Autenticado |
| Editar seu próprio perfil | ✅ | Autenticado, proprietário |
| Ativar/desativar status | ✅ | Autenticado, proprietário |
| Receber notificações de chamados | ✅ | Autenticado, status online |
| Ver detalhes do chamado | ✅ | Autenticado, oferta recebida |
| Aceitar chamado | ✅ | Autenticado, proprietário da oferta, first come first served |
| Atualizar localização | ✅ | Autenticado, chamado ativo |
| Enviar mensagens | ✅ | Autenticado, em chamado ativo |
| Deletar conversa (soft delete) | ✅ | Autenticado, proprietário |
| Marcar como chegado | ✅ | Autenticado, proprietário, a caminho |
| Iniciar atendimento | ✅ | Autenticado, proprietário, chegou |
| Completar atendimento | ✅ | Autenticado, proprietário, em andamento |
| Cancelar chamado | ✅ | Autenticado, proprietário, com justificativa |
| Avaliar cliente | ✅ | Autenticado, chamado concluído, primeira vez |
| Ver ganhos | ✅ | Autenticado, proprietário |
| Conectar Mercado Pago | ✅ | Autenticado, proprietário, verificado |
| Ver histórico | ✅ | Autenticado |
| --- | --- | --- |
| Ver outros chaveiros | ❌ | NUNCA |
| Editar outro chaveiro | ❌ | NUNCA |
| Ver dados privados de cliente | ❌ | NUNCA (apenas necessário para atendimento) |
| Ver dados de pagamento de outro | ❌ | NUNCA |
| Acessar painel administrativo | ❌ | NUNCA |

### ADMINISTRADOR

| Operação | Permitido | Validações |
|----------|-----------|-----------|
| Ver todos os clientes | ✅ | Admin autenticado |
| Editar dados de cliente | ✅ | Admin autenticado, log de auditoria |
| Bloquear cliente | ✅ | Admin autenticado, motivo registrado |
| Desbloquear cliente | ✅ | Admin autenticado |
| Ver todos os chaveiros | ✅ | Admin autenticado |
| Verificar documentos de chaveiro | ✅ | Admin autenticado |
| Bloquear chaveiro | ✅ | Admin autenticado, motivo, duração |
| Desbloquear chaveiro | ✅ | Admin autenticado |
| Ver todos os chamados | ✅ | Admin autenticado |
| Editar detalhes do chamado | ✅ | Admin autenticado, log de auditoria |
| Cancelar chamado | ✅ | Admin autenticado, motivo |
| Ver pagamentos | ✅ | Admin autenticado |
| Reembolsar cliente | ✅ | Admin autenticado, log de auditoria |
| Gerar payouts | ✅ | Admin autenticado |
| Configurar preços | ✅ | Admin autenticado, histórico de mudanças |
| Configurar veículos | ✅ | Admin autenticado |
| Gerenciar FIPE | ✅ | Admin autenticado |
| Gerar relatórios | ✅ | Admin autenticado |
| Ver auditoria | ✅ | Admin autenticado |
| Configurar sistema | ✅ | Admin autenticado |

---

## 2. REGRAS DE AUTORIZAÇÃO NO BACKEND

### Princípio Fundamental

**NUNCA confiar no frontend**

Toda operação deve validar no backend:

```javascript
// ✅ CORRETO
async function getServiceRequest(userId, requestId) {
  // 1. Validar autenticação
  if (!userId) throw new UnauthorizedError();
  
  // 2. Buscar solicitação
  const request = await db.query('SELECT * FROM service_requests WHERE id = ?', [requestId]);
  if (!request) throw new NotFoundError();
  
  // 3. Validar propriedade
  if (request.customer_id !== userId && request.locksmith_id !== userId) {
    throw new ForbiddenError('Acesso negado');
  }
  
  // 4. Se cliente, ocultar dados privados do chaveiro
  if (request.customer_id === userId) {
    delete request.locksmith_payment_info;
    delete request.locksmith_document;
  }
  
  return request;
}

// ❌ ERRADO
async function getServiceRequest(requestId) {
  // Nunca:
  // - Confiar no user_id do frontend
  // - Pular validação de propriedade
  // - Devolver dados privados sem filtro
  return await db.query('SELECT * FROM service_requests WHERE id = ?', [requestId]);
}
```

### Validações Obrigatórias

#### 1. Autenticação
```javascript
// Middleware de autenticação
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar que o usuário ainda existe e está ativo
    const user = await db.query(
      'SELECT id, user_type, is_active FROM users WHERE id = ?',
      [decoded.sub]
    );
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }
    
    req.user = { id: user.id, type: user.user_type };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

#### 2. Autorização
```javascript
// Middleware de tipo de usuário
export const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.type)) {
    return res.status(403).json({ error: 'Permissão negada' });
  }
  next();
};

// Uso
router.post('/services', 
  authMiddleware, 
  requireRole(['customer']),
  createServiceRequest
);
```

#### 3. Propriedade de Recurso
```javascript
// Validação de propriedade
export const validateOwnership = (resourceType) => async (req, res, next) => {
  const { id } = req.params;
  
  let owner;
  
  if (resourceType === 'service_request') {
    const request = await db.query(
      'SELECT customer_id, locksmith_id FROM service_requests WHERE id = ?',
      [id]
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Não encontrado' });
    }
    
    owner = req.user.type === 'customer' 
      ? request.customer_id 
      : request.locksmith_id;
  }
  
  if (owner !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  next();
};

// Uso
router.get('/jobs/:id',
  authMiddleware,
  validateOwnership('service_request'),
  getJobDetails
);
```

---

## 3. PROTEÇÃO CONTRA ATAQUES COMUNS

### IDOR (Insecure Direct Object Reference)

```javascript
// ❌ VULNERÁVEL
app.get('/api/customers/:id', (req, res) => {
  const customer = db.query('SELECT * FROM customer_profiles WHERE id = ?', [req.params.id]);
  res.json(customer); // Qualquer um pode acessar qualquer ID
});

// ✅ SEGURO
app.get('/api/customers/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  // Validar que é o próprio usuário
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const customer = db.query('SELECT * FROM customer_profiles WHERE user_id = ?', [req.user.id]);
  res.json(customer);
});
```

### SQL Injection

```javascript
// ❌ VULNERÁVEL
const email = req.body.email;
const user = db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SEGURO - Prepared statements
const user = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

// Login: máximo 5 tentativas por 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

router.post('/auth/login', loginLimiter, loginController);

// API geral: 100 requisições por hora
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100
});

app.use('/api/', apiLimiter);
```

### CSRF Protection

```javascript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Todas as mutações exigem token CSRF
app.post('/api/jobs', csrfProtection, createJob);
```

### XSS Protection

```javascript
import helmet from 'helmet';
import mongoSanitize from 'mongo-sanitize';

// Helmet para headers de segurança
app.use(helmet());

// Sanitizar dados de entrada
app.use(mongoSanitize());

// Validar e escapar saída
const sanitizeHTML = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

### Validação de Entrada

```javascript
import { z } from 'zod';

const createServiceRequestSchema = z.object({
  service_id: z.string().uuid(),
  address: z.string().min(10).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(1000).optional(),
  vehicle_plate: z.string().regex(/^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/).optional()
});

app.post('/api/jobs', async (req, res) => {
  try {
    const data = createServiceRequestSchema.parse(req.body);
    // ... validação passou
  } catch (error) {
    return res.status(400).json({ error: error.errors });
  }
});
```

---

## 4. PROTEÇÃO DE DADOS SENSÍVEIS

### O que NUNCA enviar ao cliente

```javascript
// ❌ NUNCA enviar
{
  password_hash: '...',
  ssn: '...',
  document: '...',
  bank_account: '...',
  payment_token: '...',
  admin_secret: '...',
  api_keys: '...',
  oauth_tokens: '...'
}

// ✅ SEGURO - dados filtrados
{
  id: '...',
  first_name: '...',
  email: '...',
  phone: '...',
  // ... dados públicos apenas
}
```

### Mascaramento de dados sensíveis

```javascript
// CPF: 123.456.789-00 → 123.456.***-**
const maskCPF = (cpf) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.***-**');

// Telefone: (11) 98765-4321 → (11) 9****-4321
const maskPhone = (phone) => phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-****');

// Email: usuario@example.com → us***@example.com
const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  return `${user.substring(0, 2)}***@${domain}`;
};
```

### Criptografia de campos sensíveis

```javascript
import crypto from 'crypto';

// Armazenar CPF criptografado
const encryptCPF = (cpf) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(cpf, 'utf-8', 'hex') + cipher.final('hex');
};

const decryptCPF = (encrypted) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encrypted, 'hex', 'utf-8') + decipher.final('utf-8');
};
```

---

## 5. WEBHOOKS E IDEMPOTÊNCIA

### Validação de Webhook

```javascript
const validateMercadoPagoWebhook = (req) => {
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  
  // 1. Validar assinatura
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    throw new Error('Assinatura inválida');
  }
  
  // 2. Validar idempotência
  const existingEvent = await db.query(
    'SELECT id FROM webhook_events WHERE request_id = ?',
    [requestId]
  );
  
  if (existingEvent) {
    // Webhook já foi processado
    return false;
  }
  
  return true;
};

// Uso
app.post('/webhooks/mercado-pago', async (req, res) => {
  try {
    if (!validateMercadoPagoWebhook(req)) {
      return res.status(200).json({ processed: false });
    }
    
    // Registrar evento
    await db.query(
      'INSERT INTO webhook_events (request_id, payload) VALUES (?, ?)',
      [req.headers['x-request-id'], JSON.stringify(req.body)]
    );
    
    // Processar pagamento
    // ...
    
    res.status(200).json({ processed: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## 6. LOGGING E AUDITORIA

### O que logar

```javascript
const logEvent = async (userId, action, entity, entityId, changes, ipAddress) => {
  await db.query(`
    INSERT INTO audit_logs 
    (user_id, action, entity_type, entity_id, changes, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `, [userId, action, entity, entityId, JSON.stringify(changes), ipAddress]);
};

// Logar eventos sensíveis
logEvent(req.user.id, 'PAYMENT_CREATED', 'payment', paymentId, {
  amount,
  customer_id,
  locksmith_id,
  status: 'pending'
}, req.ip);

logEvent(req.user.id, 'PRICING_RULE_UPDATED', 'pricing_rule', ruleId, {
  old: oldValues,
  new: newValues
}, req.ip);
```

### O que NÃO logar

```javascript
// ❌ NUNCA logar
// - Senhas
// - Tokens
// - Informações bancárias
// - Dados de cartão
// - CPF completo
```

---

## 7. CHECKLIST DE SEGURANÇA PRE-DEPLOY

- [ ] Todas as rotas têm autenticação
- [ ] Todas as rotas validam autorização
- [ ] Senhas com hash bcrypt (min 12 rounds)
- [ ] JWTs com expiração
- [ ] Rate limiting implementado
- [ ] HTTPS obrigatório
- [ ] CORS configurado corretamente
- [ ] Headers de segurança (Helmet)
- [ ] Validação de entrada
- [ ] Sanitização de output
- [ ] Proteção CSRF
- [ ] Proteção contra SQL injection
- [ ] Logs de auditoria funcionando
- [ ] Webhook validation implementado
- [ ] Idempotência em operações críticas
- [ ] Dados sensíveis não expostos em logs
- [ ] Secrets em variáveis de ambiente
- [ ] Database backups automáticos
- [ ] Plano de resposta a incidentes
- [ ] Testes de segurança executados
