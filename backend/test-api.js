import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhbmFAdGVzdGUuY29tIiwidHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzkwMzA5NTM3LCJleHAiOjE3OTAzOTU5Mzd9.YkGYeWUrzM6MiH3MQt4t6V0W3GnRrbDLhTLkEUDqrqs';

console.log('🧪 TESTE DO ENDPOINT /api/customers/me');
console.log('═══════════════════════════════════════\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/customers/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Resposta da API:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro na requisição:');
  console.log(error.message);
});

req.end();
