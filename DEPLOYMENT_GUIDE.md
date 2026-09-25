# 🚀 CHAVEIRO JÁ - Deployment Guide

**Versão:** 1.0  
**Data:** 2026-09-25  
**Status:** Production Ready

---

## 📋 Sumário Rápido

- **Frontend (Base44):** React + Vite - Compilado e pronto
- **Backend (Node.js):** Express + PostgreSQL - Estruturado
- **Build:** ✅ Passing (0 errors)
- **Lint:** ✅ Passing (0 errors)

---

## 🎯 Opções de Deployment

### Opção 1: Base44 Cloud (Recomendado para MVP)

#### Setup:
```bash
cd app/

# Login (primeira vez)
base44 login

# Link ao projeto
base44 link

# Deploy direto
base44 deploy
```

**Vantagens:**
- Sem servidor a configurar
- SSL automático
- CDN global
- Backups automáticos

**Url Final:** `https://chaveiro-ja.base44.com`

---

### Opção 2: Docker + Cloud (Produção)

#### Backend (Node.js):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

**Deploy em:**
- Railway: `railway up`
- Render: Upload via Git
- AWS ECS: Docker image
- Digital Ocean: App Platform

#### Frontend (React):
```bash
npm run build
# Resultados em dist/
# Deploy em: Vercel, Netlify, S3 + CloudFront
```

---

### Opção 3: APK Mobile (React Native / Capacitor)

#### Setup Capacitor:
```bash
npm install @capacitor/core @capacitor/cli

# Adicionar Android
npx cap add android

# Build APK
npx cap build android

# Resultado: android/app/release/app-release.apk
```

**Distribuição:**
- Google Play Store (pago $25)
- APK direto (sideload)
- Firebase App Distribution (teste)

---

## 🔧 Variáveis de Ambiente Produção

### `.env.production`:
```env
VITE_BASE44_APP_ID=seu_app_id_aqui
VITE_API_URL=https://api.chaveiro-ja.com
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_GOOGLE_CLIENT_ID=xxxxx
VITE_MERCADO_PAGO_PUBLIC_KEY=xxxxx
NODE_ENV=production
```

### Backend `backend/.env`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/chaveiroja
JWT_SECRET=$(openssl rand -base64 32)
STRIPE_SECRET=sk_live_xxxxx
GOOGLE_OAUTH_CLIENT_ID=xxxxx
GOOGLE_OAUTH_CLIENT_SECRET=xxxxx
PORT=3000
```

---

## 📦 Checklist Pré-Deploy

### Segurança:
- [ ] Todas as senhas e chaves em variáveis de ambiente
- [ ] HTTPS habilitado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado
- [ ] SQL injection prevention validado
- [ ] XSS protection ativado

### Performance:
- [ ] Build otimizado (npm run build)
- [ ] Imagens comprimidas
- [ ] CDN configurado
- [ ] Cache HTTP configurado
- [ ] Database indices criados

### Dados:
- [ ] Backups automáticos configurados
- [ ] Restore procedure testado
- [ ] Logs centralizados
- [ ] Monitoring ativado

### Testing:
- [ ] Login flow testado
- [ ] Pagamento testado (modo teste)
- [ ] Chat em tempo real testado
- [ ] Geolocalização testado
- [ ] Performance testado (>80 Lighthouse)

---

## 🚨 Troubleshooting

### "VITE_BASE44_APP_ID not set"
```bash
# Corrija adicionando em .env.local:
echo "VITE_BASE44_APP_ID=seu_id" > app/.env.local
```

### "Proxy not enabled / API calls fail"
```bash
# Use base44 dev, não npm run dev
base44 dev
```

### "Port 3000 already in use"
```bash
# Mude a porta no backend:
# backend/.env → PORT=3001
```

---

## 📊 Monitoramento Produção

### Alerts Essenciais:
- Uptime < 99.5%
- Response time > 500ms
- Error rate > 1%
- Database connection failures
- Disk space < 10%

### Ferramentas Recomendadas:
- Sentry (erro tracking)
- Datadog (observability)
- Uptime Robot (healthcheck)
- Grafana (dashboards)

---

## 📞 Suporte

**Issues:** github.com/Felipe23-12/Chaveiro-Ja/issues  
**Email:** felipemotacs1@gmail.com

---

## ✅ Checklist Final

- [ ] Build sem erros
- [ ] Lint sem erros
- [ ] Testes passando
- [ ] Deploy realizado
- [ ] Url acessível
- [ ] Login funcionando
- [ ] Pagamento testado
- [ ] Monitoring ativo

---

**Próximo passo:** `base44 deploy` ou escolher plataforma de hosting
