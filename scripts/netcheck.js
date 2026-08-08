const urls = ['http://localhost:8080/api/products', 'http://localhost:8080/3102', 'http://localhost:8080/'];
(async () => {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      console.log('URL:', url);
      console.log('Status:', res.status);
      console.log('Content-Type:', res.headers.get('content-type'));
      console.log('Body snippet:', text.slice(0, 300).replace(/\n/g, ' '));
    } catch (err) {
      console.log('URL:', url);
      console.log('ERROR:', err.message);
    }
    console.log('---');
  }
})();
