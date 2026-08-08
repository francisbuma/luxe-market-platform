const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const urls = [
    'http://localhost:8080/',
    'http://localhost:8080/pages/products.html'
  ];

  const out = { runAt: new Date().toISOString(), pages: [] };

  // Try to use a locally installed Chrome/Edge binary if Playwright browser binaries
  // are not installed (avoids large downloads when disk/connection is constrained).
  const candidatePaths = [
    process.env.CHROME_PATH,
    process.env.CHROME_EXE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);

  let launchOptions = { headless: true };
  const found = candidatePaths.find(p => p && fs.existsSync(p));
  if (found) {
    launchOptions.executablePath = found;
    console.log('Using local browser executable:', found);
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    out.console = out.console || [];
    out.console.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });

  page.on('pageerror', err => {
    out.pageErrors = out.pageErrors || [];
    out.pageErrors.push(String(err));
  });

  for (const url of urls) {
    const pageRecord = { url, requests: [], responses: [], requestFailures: [], start: Date.now() };

    page.on('request', req => {
      pageRecord.requests.push({ id: req._requestId || req.url() + Math.random(), url: req.url(), method: req.method(), resourceType: req.resourceType(), timestamp: Date.now() });
    });
    page.on('response', async res => {
      try {
        const timing = res.timing ? res.timing() : null;
        pageRecord.responses.push({ url: res.url(), status: res.status(), statusText: res.statusText(), headers: res.headers(), timing });
      } catch (e) {
        pageRecord.responses.push({ url: res.url(), status: res.status(), statusText: res.statusText() });
      }
    });
    page.on('requestfailed', req => {
      pageRecord.requestFailures.push({ url: req.url(), failure: req.failure() ? req.failure().errorText : null });
    });

    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      pageRecord.status = resp ? resp.status() : null;
      pageRecord.contentSnippet = await page.content().then(c => c.slice(0, 800));
    } catch (err) {
      pageRecord.error = String(err);
    }

    pageRecord.end = Date.now();
    pageRecord.durationMs = pageRecord.end - pageRecord.start;

    out.pages.push(pageRecord);

    // remove listeners to avoid duplication on next iteration
    page.removeAllListeners('request');
    page.removeAllListeners('response');
    page.removeAllListeners('requestfailed');
  }

  await browser.close();

  const outPath = './scripts/headless-trace-output.json';
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Trace complete. Output written to', outPath);
  console.log('Summary:');
  out.pages.forEach(p => {
    console.log(`\nURL: ${p.url}`);
    if (p.status) console.log('  Status:', p.status);
    if (p.error) console.log('  Error:', p.error);
    console.log('  Requests:', p.requests.length, 'Responses:', p.responses.length, 'Failures:', p.requestFailures.length);
    console.log('  Duration(ms):', p.durationMs);
  });
})();
