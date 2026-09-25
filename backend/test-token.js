import jwt from 'jsonwebtoken';

const SECRET = 'my_super_secret_key_for_jwt_access_token_generation';

// Token da Ana
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhbmFAdGVzdGUuY29tIiwidHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzkwMzA5NTM3LCJleHAiOjE3OTAzOTU5Mzd9.YkGYeWUrzM6MiH3MQt4t6V0W3GnRrbDLhTLkEUDqrqs';

console.log('🧪 TESTE DE TOKEN');
console.log('═══════════════════════════════════════');

try {
  const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
  console.log('✅ Token VÁLIDO!');
  console.log('Conteúdo:', decoded);
} catch (error) {
  console.log('❌ Token INVÁLIDO');
  console.log('Erro:', error.message);

  // Tenta decodificar sem verificar
  const decoded = jwt.decode(token);
  console.log('\nConteúdo do token (sem verificar):');
  console.log(decoded);
}
