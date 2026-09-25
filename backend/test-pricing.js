import http from 'http';

const testCases = [
  {
    name: 'Abertura Comum (Normal)',
    service_id: '1',
    options: {},
  },
  {
    name: 'Abertura Comum (Chuva)',
    service_id: '1',
    options: { weather: 'rain' },
  },
  {
    name: 'Chave Presença (Normal)',
    service_id: '10',
    options: {},
  },
  {
    name: 'Chave do Zero (Urgente)',
    service_id: '11',
    options: { urgency: 'urgent' },
  },
];

console.log('🧪 TESTE - SISTEMA DE PREÇOS');
console.log('═══════════════════════════════════════\n');

async function testQuote(testCase) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      service_id: testCase.service_id,
      ...testCase.options,
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/pricing/quote',
      method: 'POST',
      headers: {
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
        try {
          const parsed = JSON.parse(data);
          const d = parsed.data;
          console.log(`📌 ${testCase.name}`);
          console.log(`   Preço Base:  R$ ${d.base_price}`);
          console.log(`   Preço Final: R$ ${d.final_price}`);
          console.log(`   Regras Aplicadas: ${d.applied_rules.length > 0 ? d.applied_rules.join(', ') : 'nenhuma'}`);
          console.log(`   Breakdown:`);
          console.log(`     - Preço do Serviço: R$ ${d.breakdown.service_price}`);
          console.log(`     - Taxa Chaveiro Já (15%): R$ ${d.breakdown.commission}`);
          console.log(`     - Valor do Chaveiro: R$ ${d.breakdown.locksmith_value}`);
          console.log('');
        } catch (e) {
          console.log(`❌ Erro em ${testCase.name}: ${e.message}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Erro: ${e.message}`);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

async function runTests() {
  for (const testCase of testCases) {
    await testQuote(testCase);
  }
  console.log('✅ Testes concluídos!');
}

runTests();
