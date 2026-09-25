import { registerUser } from './src/services/authService.js';

const admin = await registerUser({
  email: 'admin@chaveiroja.com',
  password: 'Admin@123456',
  name: 'Admin Chaveiro Já',
  role: 'admin'
});

console.log('✅ Admin criado!');
console.log('Email: admin@chaveiroja.com');
console.log('Senha: Admin@123456');