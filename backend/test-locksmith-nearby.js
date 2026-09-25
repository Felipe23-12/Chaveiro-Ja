import http from 'http';

console.log('🧪 TESTE - GET /api/locksmiths/nearby (PÚBLICO)');
console.log('═══════════════════════════════════════\n');

// Coordenadas de São Paulo
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/locksmiths/nearby?latitude=-23.5505&longitude=-46.6333&max_distance=20',
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
    console.log('Resposta:');
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Chaveiros encontrados:', parsed.data.length);
      if (parsed.data.length > 0) {
        console.log('\nPrimeiro chaveiro:');
        console.log('  Empresa:', parsed.data[0].company_name);
        console.log('  Status:', parsed.data[0].status);
        console.log('  Avaliação:', parsed.data[0].rating);
      }
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.end();
