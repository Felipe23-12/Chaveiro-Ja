import http from 'http';

console.log('🧪 TESTE - GET /api/services (Listar todos)');
console.log('═══════════════════════════════════════\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/services',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Serviços carregados:');
    try {
      const parsed = JSON.parse(data);
      parsed.data.forEach((service, index) => {
        console.log(`\n${index + 1}. ${service.name}`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Descrição: ${service.description}`);
        console.log(`   Categoria: ${service.category}`);
        console.log(`   Ícone: ${service.icon || 'nenhum'}`);
      });
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.end();
