const http = require('http');

function request(path, method = 'GET', body, cookie) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request({ host: 'localhost', port: 8180, path, method, headers }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  const email = `verify-flow-${Date.now()}@example.com`;
  const registerRes = await request('/api/session/register', 'POST', {
    email,
    password: 'secret123',
    firstName: 'Verify',
    lastName: 'Flow',
    phone: '123456789'
  });

  console.log('register status:', registerRes.status);
  console.log('register body:', registerRes.body);
  const setCookie = (registerRes.headers['set-cookie'] || [])[0] || '';
  console.log('set-cookie:', setCookie);

  const meRes = await request('/api/session/me', 'GET', null, setCookie.split(';')[0]);
  console.log('me status:', meRes.status);
  console.log('me body:', meRes.body);
})();
