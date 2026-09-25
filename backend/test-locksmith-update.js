import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2FvLmNoYXZlaXJvQHRlc3RlLmNvbSIsInR5cGUiOiJsb2Nrc21pdGgiLCJpYXQiOjE3OTAzMTAzOTIsImV4cCI6MTc5MDM5Njc5Mn0.ZC7FwGyWR9y1ebLLCixrTlPd2Wsu3aZ9i84D_uxXQuw';

const updateData = {
  company_name: 'Chaveiro João Rápido',
  phone: '11987654321',
  description: 'Chaveiro profissional com 10 anos de experiência',
  years_experience: 10,
  latitude: -23.5505,
  longitude: -46.6333,
  service_radius_km: 15,
  hourly_rate: 150,
  bank_account: '12345-6789',
};

const body = JSON.stringify(updateData);

console.log('🧪 TESTE - PUT /api/locksmiths/me');
console.log('═══════════════════════════════════════\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/locksmiths/me',
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
    console.log('Status:', res.statusCode);
    console.log('Resposta:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.write(body);
req.end();
