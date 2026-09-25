import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhbmFAdGVzdGUuY29tIiwidHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzkwMzA5NTM3LCJleHAiOjE3OTAzOTU5Mzd9.YkGYeWUrzM6MiH3MQt4t6V0W3GnRrbDLhTLkEUDqrqs';

const updateData = {
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  state: 'SP',
  postal_code: '01234-567',
  latitude: -23.5505,
  longitude: -46.6333,
};

const body = JSON.stringify(updateData);

console.log('🧪 TESTE - UPDATE /api/customers/me');
console.log('═══════════════════════════════════════\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/customers/me',
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': body.length,
  },
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`Status: ${res.statusCode}`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Resposta da API:');
    if (data) {
      try {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
      } catch (e) {
        console.log(data);
      }
    } else {
      console.log('(vazio)');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro:', error.message);
});

req.write(body);
req.end();
