# 🔐 CHAVEIRO JÁ - BACKEND

Backend Node.js + Express + PostgreSQL para a plataforma de marketplace de serviços de chaveiro.

## 📋 Documentação

- **[ARQUITETURA.md](./ARQUITETURA.md)** - Visão geral do sistema, stack, estrutura
- **[BANCO_DADOS.md](./BANCO_DADOS.md)** - Schema SQL completo do PostgreSQL
- **[PERMISSOES.md](./PERMISSOES.md)** - Matriz de controle de acesso e segurança
- **[PLANO_IMPLEMENTACAO.md](./PLANO_IMPLEMENTACAO.md)** - Timeline e fases de desenvolvimento
- **[SETUP_INICIADO.md](./SETUP_INICIADO.md)** - Guia de setup inicial

## 🚀 Quick Start

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (opcional, para cache)
- npm ou yarn

### 2. Instalação

```bash
# Clone o repositório
git clone seu_repo_aqui
cd chaveiroja-backend

# Copie o arquivo de ambiente
cp .env.example .env

# Edite o .env com suas configurações
nano .env

# Instale dependências
npm install
```

### 3. Setup do Banco de Dados

```bash
# Crie o banco de dados
createdb -U postgres chaveiroja

# Execute o schema (se estiver usando Drizzle)
npm run db:push

# Ou execute manualmente
psql -U postgres -d chaveiroja -f BANCO_DADOS.sql

# (Opcional) Adicione dados de teste
npm run db:seed
```

### 4. Executar o Servidor

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── config/              # Configuração
│   └── environment.ts   # Variáveis de ambiente
├── db/                  # Banco de dados
│   ├── schema.ts        # Schema Drizzle ORM
│   └── seed.ts          # Dados de teste
├── middleware/          # Middlewares
│   ├── auth.ts          # Autenticação JWT
│   ├── validation.ts    # Validação de dados
│   └── errorHandler.ts  # Tratamento de erros
├── routes/              # Rotas da API
│   ├── index.ts         # Router principal
│   ├── auth.routes.ts
│   ├── customers.routes.ts
│   ├── locksmiths.routes.ts
│   ├── services.routes.ts
│   ├── jobs.routes.ts
│   ├── payments.routes.ts
│   └── chat.routes.ts
├── controllers/         # Controladores
│   ├── authController.ts
│   ├── customerController.ts
│   ├── locksmithController.ts
│   ├── jobController.ts
│   └── paymentController.ts
├── services/            # Lógica de negócio
│   ├── authService.ts
│   ├── jobService.ts
│   ├── pricingService.ts
│   ├── locationService.ts
│   ├── paymentService.ts
│   └── searchService.ts
├── types/               # Tipos TypeScript
│   └── index.ts
├── utils/               # Funções utilitárias
│   ├── jwt.ts           # JWT
│   ├── password.ts      # Hash de senha
│   ├── validators.ts    # Validação Zod
│   └── helpers.ts       # Helpers gerais
└── index.ts             # Servidor Express

tests/                   # Testes
├── unit/
├── integration/
└── security/

docs/                    # Documentação
└── *.md
```

## 🔌 API Endpoints

### Health Check
```
GET /health                  # Health check
GET /api/version            # Versão da API
```

### Authentication (A implementar)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google/callback
POST   /api/auth/refresh-token
POST   /api/auth/logout
```

### Customers (A implementar)
```
GET    /api/customers/me
PUT    /api/customers/me
POST   /api/customers/complete-profile
```

### Locksmiths (A implementar)
```
GET    /api/locksmiths/me
PUT    /api/locksmiths/me
POST   /api/locksmiths/status
```

### Services (A implementar)
```
GET    /api/services
GET    /api/services/:id
```

### Jobs (A implementar)
```
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id/accept
PUT    /api/jobs/:id/complete
PUT    /api/jobs/:id/cancel
```

## 🔐 Autenticação

O projeto usa **JWT (JSON Web Tokens)** para autenticação.

### Fluxo

1. Usuário faz login ou se registra
2. Servidor gera um `access_token` (24h) e `refresh_token` (7d)
3. Cliente envia o `access_token` no header `Authorization: Bearer <token>`
4. Quando expirar, usa `refresh_token` para obter novo `access_token`

### Headers

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Banco de Dados

PostgreSQL com as seguintes tabelas:

- `users` - Usuários (cliente, chaveiro, admin)
- `customer_profiles` - Perfis de clientes
- `locksmith_profiles` - Perfis de chaveiros
- `services` - Tipos de serviços
- `service_requests` - Chamados/Jobs
- `payments` - Pagamentos
- `messages` - Chat
- `reviews` - Avaliações
- `audit_logs` - Auditoria

Veja **[BANCO_DADOS.md](./BANCO_DADOS.md)** para o schema completo.

## 🧪 Testes

```bash
# Executar testes
npm test

# Com cobertura
npm run test:coverage

# Específico
npm test -- --run auth.test.ts
```

## 📦 Build e Deploy

### Build
```bash
npm run build
```

### Deploy (exemplo Railway)
```bash
# Instale a CLI do Railway
npm install -g railway

# Faça login
railway login

# Deploy
railway up
```

## 🔒 Segurança

- ✅ JWT com expiração
- ✅ Bcryptjs para hash de senhas (12 rounds)
- ✅ Validação de entrada com Zod
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Rate limiting (a implementar)
- ✅ Auditoria de operações sensíveis
- ⚠️ Adicione HTTPS em produção

## 🚨 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "ECONNREFUSED" no banco de dados
Verifique se PostgreSQL está rodando:
```bash
# macOS/Linux
pg_isready

# Windows
netstat -an | findstr :5432
```

### "JWT_SECRET deve ter pelo menos 32 caracteres"
Gere um valor seguro:
```bash
openssl rand -base64 32
```

## 📝 Variáveis de Ambiente

Veja **[.env.example](./.env.example)** para todas as variáveis necessárias.

Principais:
- `DATABASE_URL` - Conexão PostgreSQL
- `JWT_SECRET` - Chave para assinar JWTs (mínimo 32 caracteres)
- `NODE_ENV` - development/production
- `PORT` - Porta do servidor (padrão 3000)

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commits com mensagens descritivas
3. Push para a branch
4. Abra um Pull Request

## 📄 Licença

MIT

## 📧 Contato

Felipe Mota - felipemotacs1@gmail.com

---

**Desenvolvido com ❤️ para o Chaveiro Já**
