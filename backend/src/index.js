import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.static(dirname(__dirname)));

let services = [
  {id: '1', type: 'Cópia', desc: 'Chave de casa', price: 50, status: 'ok'},
  {id: '2', type: 'Abertura', desc: 'Porta travada', price: 150, status: 'ok'},
];

let chats = [];
let reviews = [];

app.post('/api/auth/login', (req, res) => {
  res.json({token: 'ok', firstName: req.body.email.split('@')[0], role: 'client'});
});

app.get('/api/services', (req, res) => res.json(services));
app.post('/api/services', (req, res) => res.json({...req.body, id: Date.now()}));
app.post('/api/chat', (req, res) => {chats.push(req.body); res.json(req.body);});
app.get('/api/chat/:id', (req, res) => res.json(chats.filter(c => c.serviceId === req.params.id)));
app.post('/api/reviews', (req, res) => {reviews.push(req.body); res.json(req.body);});

app.listen(3000, () => console.log('✅ http://localhost:3000/app.html'));