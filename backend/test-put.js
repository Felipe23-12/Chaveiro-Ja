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

console.log('Enviando dados:', body);
console.log('Tamanho:', body.length);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/customers/me',
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nStatus:', res.statusCode);
    console.log('Resposta:', data);
  });
});

req.on('error', (e) => {
  console.error('Erro:', e.message);
});

req.write(body);
req.end();
