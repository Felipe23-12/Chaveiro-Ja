import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import locksmithRoutes from './routes/locksmith.routes.js';
import serviceRoutes from './routes/service.routes.js';
import pricingRoutes from './routes/pricing.routes.js';
import jobRoutes from './routes/job.routes.js';
import locationRoutes from './routes/location.routes.js';
import messageRoutes from './routes/message.routes.js';
import reviewRoutes from './routes/review.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { authMiddleware } from './middleware/auth.js';
import { initializeSocket } from './socket/index.js';

const app = express();
const httpServer = createServer(app);
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const io = initializeSocket(httpServer);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(rootDir));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'development',
    uptime: process.uptime(),
  });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'Chaveiro Já Backend API',
    environment: 'development',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/locksmiths', locksmithRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// ============================================
// TEST ENDPOINTS (REMOVER EM PRODUÇÃO)
// ============================================

app.get('/api/test/auth', authMiddleware, (req, res) => {
  res.json({
    message: 'Autenticação funciona!',
    user: req.user,
  });
});

// ============================================
// ADMIN PANEL
// ============================================

app.post('/admin-panel', (req, res) => {
  const tab = req.query.tab || 'dashboard';
  res.redirect(`/admin-panel?tab=${tab}`);
});

app.get('/admin-panel', (req, res) => {
  const tab = req.query.tab || 'dashboard';
  let content = '';

  if(tab === 'pricing') content = '<h2>💰 Preços</h2><table><tr><th>Serviço</th><th>Preço</th></tr><tr><td>Abertura Simples</td><td>R$ 130</td></tr></table>';
  else if(tab === 'rules') content = '<h2>📋 Regras</h2><p>Criar nova regra aqui</p>';
  else if(tab === 'settings') content = '<h2>⚙️ Config</h2><p>Taxa: 15%</p>';
  else content = '<h2>Dashboard</h2><p>5 serviços ativos</p>';

  res.type('text/html').send(`<!DOCTYPE html><html><head><title>Admin</title><style>body{font-family:Arial}.nav a{padding:10px 20px;background:#3498db;color:white;text-decoration:none;margin:5px;display:inline-block;border-radius:5px}.nav a.active{background:#27ae60}.content{padding:20px;background:white;margin:10px}</style></head><body><div class="nav"><a href="/admin-panel?tab=dashboard" ${tab==='dashboard'?'class="active"':''}>Dashboard</a><a href="/admin-panel?tab=pricing" ${tab==='pricing'?'class="active"':''}>Preços</a><a href="/admin-panel?tab=rules" ${tab==='rules'?'class="active"':''}>Regras</a><a href="/admin-panel?tab=settings" ${tab==='settings'?'class="active"':''}>Config</a></div><div class="content">${content}</div></body></html>`);
});
<!DOCTYPE html>
<html>
<head>
  <title>Admin - Chaveiro Já</title>
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: Arial; background: #f5f5f5; }
    .header { background: #2c3e50; color: white; padding: 20px; }
    .nav { display: flex; gap: 10px; padding: 10px; flex-wrap: wrap; }
    .nav button { padding: 10px 20px; background: #3498db; color: white; border: none; cursor: pointer; border-radius: 5px; }
    .nav button:hover { background: #2980b9; }
    .content { background: white; padding: 20px; margin: 10px; border-radius: 5px; }
    .section { display: none; }
    .section.show { display: block; }
    h2 { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; }
    input, select { padding: 8px; margin: 5px 0; width: 100%; max-width: 300px; }
    .btn { padding: 10px 20px; background: #27ae60; color: white; border: none; cursor: pointer; margin-top: 10px; }
    .btn:hover { background: #229954; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔧 Chaveiro Já - Painel Admin</h1>
    <p>Gerencie preços, regras e serviços</p>
  </div>

  <div class="nav">
    <button onclick="show('dashboard')">📊 Dashboard</button>
    <button onclick="show('pricing')">💰 Preços</button>
    <button onclick="show('rules')">📋 Regras</button>
    <button onclick="show('settings')">⚙️ Configurações</button>
  </div>

  <div class="content">
    <div id="dashboard" class="section show">
      <h2>📊 Dashboard</h2>
      <table>
        <tr><th>Métrica</th><th>Valor</th></tr>
        <tr><td>Serviços Ativos</td><td>5</td></tr>
        <tr><td>Taxa de Comissão</td><td>15%</td></tr>
        <tr><td>Status</td><td>✅ Online</td></tr>
      </table>
    </div>

    <div id="pricing" class="section">
      <h2>💰 Gerenciar Preços</h2>
      <h3>Serviços e Preços</h3>
      <table>
        <thead>
          <tr><th>Serviço</th><th>Preço</th><th>Comissão 15%</th><th>Valor Chaveiro</th></tr>
        </thead>
        <tbody>
          <tr><td>Abertura Simples</td><td>R$ 130</td><td>R$ 19,50</td><td>R$ 110,50</td></tr>
          <tr><td>Abertura Tetra</td><td>R$ 160</td><td>R$ 24,00</td><td>R$ 136,00</td></tr>
          <tr><td>Abertura Eletrônica</td><td>R$ 200</td><td>R$ 30,00</td><td>R$ 170,00</td></tr>
          <tr><td>Chave Moto</td><td>R$ 150</td><td>R$ 22,50</td><td>R$ 127,50</td></tr>
          <tr><td>Chave Carro</td><td>R$ 200</td><td>R$ 30,00</td><td>R$ 170,00</td></tr>
        </tbody>
      </table>
      <h3 style="margin-top: 20px;">Editar Preço</h3>
      <input type="number" placeholder="Novo preço" value="130">
      <button class="btn" onclick="alert('Preço salvo!')">💾 Salvar</button>
    </div>

    <div id="rules" class="section">
      <h2>📋 Regras de Cobrança</h2>
      <input type="text" placeholder="Nome da regra" value="Cobrança Noturna">
      <select>
        <option>Horário do Dia</option>
        <option>Clima</option>
        <option>Urgência</option>
        <option>Região</option>
      </select>
      <input type="number" placeholder="Multiplicador" value="1.2" min="0.5" max="3" step="0.1">
      <button class="btn" onclick="alert('Regra criada!')">➕ Criar</button>
      <h3 style="margin-top: 20px;">Regras Ativas</h3>
      <p>Nenhuma regra criada ainda</p>
    </div>

    <div id="settings" class="section">
      <h2>⚙️ Configurações</h2>
      <label>Taxa de Comissão (%):</label>
      <input type="number" value="15">
      <label>Raio de Busca (km):</label>
      <input type="number" value="15">
      <label>Velocidade Média (km/h):</label>
      <input type="number" value="40">
      <button class="btn" onclick="alert('Configurações salvas!')">💾 Salvar</button>
    </div>
  </div>

  <script>
    function show(id) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('show'));
      document.getElementById(id).classList.add('show');
    }
  </script>
</body>
</html>
  `);
});

app.get('/admin', (req, res) => {
  res.type('text/html').send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chaveiro Já - Admin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    header h1 { font-size: 32px; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
    .tab-btn { padding: 15px 25px; background: none; border: none; cursor: pointer; font-size: 15px; font-weight: 500; color: #666; border-bottom: 3px solid transparent; transition: all 0.3s; }
    .tab-btn.active { color: #667eea; border-bottom-color: #667eea; }
    .tab-content { display: none; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .tab-content.active { display: block; }
    .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: #667eea; color: white; }
    .btn:hover { background: #5568d3; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f9f9f9; padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    td { padding: 15px; border-bottom: 1px solid #f0f0f0; }
    .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; }
    .alert.show { display: block; background: #c6f6d5; color: #22543d; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔧 Chaveiro Já - Painel Administrativo</h1>
      <p>Gerencie preços, regras e configurações</p>
    </header>

    <div id="alert" class="alert"></div>

    <div class="tabs">
      <button class="tab-btn active" onclick="showTab('dashboard')">📊 Dashboard</button>
      <button class="tab-btn" onclick="showTab('pricing')">💰 Preços</button>
      <button class="tab-btn" onclick="showTab('rules')">📋 Regras</button>
      <button class="tab-btn" onclick="showTab('settings')">⚙️ Configurações</button>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="tab-content active">
      <h2>📊 Dashboard</h2>
      <p>Bem-vindo ao painel de controle!</p>
      <table>
        <tr><th>Métrica</th><th>Valor</th></tr>
        <tr><td>Serviços Ativos</td><td>5</td></tr>
        <tr><td>Taxa de Comissão</td><td>15%</td></tr>
        <tr><td>Regras Criadas</td><td id="rules-count">0</td></tr>
      </table>
    </div>

    <!-- PREÇOS -->
    <div id="pricing" class="tab-content">
      <h2>💰 Gerenciar Preços</h2>
      <table>
        <thead>
          <tr><th>Serviço</th><th>Preço</th><th>Comissão 15%</th><th>Valor Chaveiro</th></tr>
        </thead>
        <tbody>
          <tr><td>Abertura Simples</td><td>R$ 130</td><td>R$ 19,50</td><td>R$ 110,50</td></tr>
          <tr><td>Abertura Tetra</td><td>R$ 160</td><td>R$ 24,00</td><td>R$ 136,00</td></tr>
          <tr><td>Abertura Eletrônica</td><td>R$ 200</td><td>R$ 30,00</td><td>R$ 170,00</td></tr>
          <tr><td>Chave Moto</td><td>R$ 150</td><td>R$ 22,50</td><td>R$ 127,50</td></tr>
          <tr><td>Chave Carro</td><td>R$ 200</td><td>R$ 30,00</td><td>R$ 170,00</td></tr>
        </tbody>
      </table>
      <br>
      <input type="number" id="new-price" placeholder="Novo preço" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      <button class="btn" onclick="savePrice()">💾 Salvar Preço</button>
    </div>

    <!-- REGRAS -->
    <div id="rules" class="tab-content">
      <h2>📋 Criar Regra de Cobrança</h2>
      <input type="text" placeholder="Nome da regra" id="rule-name" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 100%; margin-bottom: 10px;">
      <input type="number" placeholder="Multiplicador (1.2 = 20% mais caro)" id="rule-mult" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 100%; margin-bottom: 10px;">
      <button class="btn" onclick="createRule()">➕ Criar Regra</button>
      <br><br>
      <h3>Regras Ativas</h3>
      <table id="rules-table">
        <thead><tr><th>Nome</th><th>Multiplicador</th><th>Ação</th></tr></thead>
        <tbody><tr><td colspan="3">Nenhuma regra criada</td></tr></tbody>
      </table>
    </div>

    <!-- SETTINGS -->
    <div id="settings" class="tab-content">
      <h2>⚙️ Configurações</h2>
      <input type="number" value="15" placeholder="Taxa de comissão" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 100%; margin-bottom: 10px;">
      <input type="number" value="40" placeholder="Velocidade média (km/h)" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 100%; margin-bottom: 10px;">
      <button class="btn" onclick="saveSettings()">💾 Salvar Configurações</button>
    </div>
  </div>

  <script>
    function showTab(name) {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(name).classList.add('active');
      event.target.classList.add('active');
    }

    function showAlert(msg) {
      const alert = document.getElementById('alert');
      alert.textContent = msg;
      alert.classList.add('show');
      setTimeout(() => alert.classList.remove('show'), 3000);
    }

    function savePrice() {
      showAlert('Preço salvo com sucesso!');
    }

    function createRule() {
      const name = document.getElementById('rule-name').value;
      if(!name) {
        showAlert('Nome obrigatório!');
        return;
      }
      showAlert('Regra criada com sucesso!');
      document.getElementById('rule-name').value = '';
    }

    function saveSettings() {
      showAlert('Configurações salvas!');
    }
  </script>
</body>
</html>
  `);
});

// ============================================
// TEST BUTTON
// ============================================

app.get('/test-button', (req, res) => {
  res.send('<h1>Teste</h1><button onclick="alert(\'FUNCIONA!\')">CLIQUE AQUI</button>');
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
  });
});

// ============================================
// START SERVER
// ============================================

httpServer.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 CHAVEIRO JÁ - BACKEND SERVER');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
  console.log(`✓ WebSocket ativo em ws://localhost:${PORT}`);
  console.log(`✓ Ambiente: development`);
  console.log('');
  console.log('📍 Endpoints disponíveis:');
  console.log('  GET    /health');
  console.log('  GET    /api/version');
  console.log('');
  console.log('  AUTH:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/auth/refresh');
  console.log('  GET    /api/auth/me (protegido)');
  console.log('  POST   /api/auth/logout (protegido)');
  console.log('  GET    /api/auth/verify (protegido)');
  console.log('');
  console.log('  CUSTOMERS:');
  console.log('  GET    /api/customers/me (protegido)');
  console.log('  PUT    /api/customers/me (protegido)');
  console.log('  POST   /api/customers/complete-profile (protegido)');
  console.log('');
  console.log('  LOCKSMITHS:');
  console.log('  GET    /api/locksmiths/me (protegido)');
  console.log('  PUT    /api/locksmiths/me (protegido)');
  console.log('  PUT    /api/locksmiths/status (protegido)');
  console.log('  POST   /api/locksmiths/verify (protegido)');
  console.log('  GET    /api/locksmiths/nearby (público)');
  console.log('  POST   /api/locksmiths/:id/rate (público)');
  console.log('');
  console.log('  SERVICES:');
  console.log('  GET    /api/services (público)');
  console.log('  GET    /api/services/:id (público)');
  console.log('  GET    /api/services/category/:category (público)');
  console.log('  POST   /api/services (admin)');
  console.log('  PUT    /api/services/:id (admin)');
  console.log('  DELETE /api/services/:id (admin)');
  console.log('');
  console.log('  PRICING:');
  console.log('  GET    /api/pricing/services/:id (público)');
  console.log('  POST   /api/pricing/quote (público)');
  console.log('  GET    /api/pricing/rules (admin)');
  console.log('  POST   /api/pricing/set-price (admin)');
  console.log('  POST   /api/pricing/rules (admin)');
  console.log('  PUT    /api/pricing/rules/:id (admin)');
  console.log('  DELETE /api/pricing/rules/:id (admin)');
  console.log('');
  console.log('  JOBS/PEDIDOS:');
  console.log('  POST   /api/jobs (cliente)');
  console.log('  GET    /api/jobs/:id (público)');
  console.log('  GET    /api/jobs/my (cliente)');
  console.log('  POST   /api/jobs/search (cliente)');
  console.log('  POST   /api/jobs/cancel (cliente)');
  console.log('  POST   /api/jobs/offer (chaveiro)');
  console.log('  GET    /api/jobs/my-offers (chaveiro)');
  console.log('  POST   /api/jobs/accept-offer (chaveiro)');
  console.log('  POST   /api/jobs/en-route (chaveiro)');
  console.log('  POST   /api/jobs/arrived (chaveiro)');
  console.log('  POST   /api/jobs/in-progress (chaveiro)');
  console.log('  POST   /api/jobs/completed (chaveiro)');
  console.log('  GET    /api/jobs/:id/offers (público)');
  console.log('');
  console.log('═══════════════════════════════════════════════════');
});