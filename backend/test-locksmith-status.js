import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2FvLmNoYXZlaXJvQHRlc3RlLmNvbSIsInR5cGUiOiJsb2Nrc21pdGgiLCJpYXQiOjE3OTAzMTAzOTIsImV4cCI6MTc5MDM5Njc5Mn0.ZC7FwGyWR9y1ebLLCixrTlPd2Wsu3aZ9i84D_uxXQuw';

const statusData = { status: 'online' };
const body = JSON.stringify(statusData);

console.log('🧪 TESTE - PUT /api/locksmiths/status');
console.log('═══════════════════════════════════════\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/locksmiths/status',
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
      const parsed = JSON.parse(data);
      console.log('Status do chaveiro:', parsed.data.status);
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
