const http = require('http');

function requestJson(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: 8080, path, method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch (e) { parsed = data; }
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  const login = await requestJson('POST', '/api/session/login', { 'Content-Type': 'application/json' }, {
    email: 'demo@luxemarket.com',
    password: 'demo123'
  });

  if (login.statusCode !== 200) {
    throw new Error(`Login failed: ${login.statusCode} ${JSON.stringify(login.body)}`);
  }

  const token = login.body.token;
  const headers = { Authorization: `Bearer ${token}` };

  const checks = [
    { name: 'customer profile', path: '/api/customer/profile', expectedStatus: 200 },
    { name: 'customer orders', path: '/api/customer/orders', expectedStatus: 200 },
    { name: 'orders', path: '/api/orders', expectedStatus: 200 },
    { name: 'cart', path: '/api/cart', expectedStatus: 200 }
  ];

  for (const check of checks) {
    const res = await requestJson('GET', check.path, headers);
    if (res.statusCode !== check.expectedStatus) {
      throw new Error(`${check.name} failed with ${res.statusCode}: ${JSON.stringify(res.body)}`);
    }
  }

  console.log('Gateway route regression checks passed');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
