import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2FvLmNoYXZlaXJvQHRlc3RlLmNvbSIsInR5cGUiOiJsb2Nrc21pdGgiLCJpYXQiOjE3OTAzMTAzOTIsImV4cCI6MTc5MDM5Njc5Mn0.ZC7FwGyWR9y1ebLLCixrTlPd2Wsu3aZ9i84D_uxXQuw';

console.log('🧪 TESTE - GET /api/locksmiths/me');
console.log('═══════════════════════════════════════\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/locksmiths/me',
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

req.end();
