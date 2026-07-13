const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Intercept requests
  await page.setRequestInterception(true);

  page.on('request', req => {
    if (req.url().includes('/api/teams/request') || req.url().includes('/api/teams/join')) {
      console.log('=== NETWORK TAB: REQUEST ===');
      console.log('REQUEST URL:', req.url());
      console.log('REQUEST METHOD:', req.method());
      console.log('REQUEST HEADERS:', req.headers());
      console.log('CONTENT-TYPE:', req.headers()['content-type'] || 'UNDEFINED');
      console.log('REQUEST PAYLOAD:', req.postData());
      
      // Let it continue so we get the status code
      req.continue();
    } else {
      req.continue();
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/teams/request') || res.url().includes('/api/teams/join')) {
      // Don't intercept OPTIONS
      if(res.request().method() === 'OPTIONS') return;
      
      console.log('=== NETWORK TAB: RESPONSE ===');
      console.log('STATUS CODE:', res.status());
      try {
        const text = await res.text();
        console.log('RESPONSE BODY:', text);
      } catch (err) {
        console.log('RESPONSE BODY: (Failed to read)', err.message);
      }
      console.log('=============================');
    }
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  console.log('Triggering POST /api/teams/request ...');
  await page.evaluate(async () => {
    try {
      await window.hackathonStore.getState().addTeamRequest({
        hackathonId: 'event123',
        title: 'Puppeteer Team',
        description: 'Test Description',
        roles: ['Developer'],
        skills: ['React'],
        createdBy: 'user456'
      });
    } catch (e) {
      console.log('Error triggering request:', e.message);
    }
  });

  console.log('Waiting for requests to finish...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await browser.close();
})();
