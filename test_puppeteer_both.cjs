const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', req => {
    if (req.url().includes('/api/teams/request') || req.url().includes('/api/teams/join')) {
      if (req.method() !== 'OPTIONS') {
        console.log('=== REQUEST ===');
        console.log('REQUEST URL:', req.url());
        console.log('REQUEST METHOD:', req.method());
        console.log('REQUEST HEADERS:', JSON.stringify(req.headers(), null, 2));
        console.log('CONTENT-TYPE:', req.headers()['content-type'] || 'UNDEFINED');
        console.log('REQUEST PAYLOAD:', req.postData());
      }
      req.continue();
    } else {
      req.continue();
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/teams/request') || res.url().includes('/api/teams/join')) {
      if(res.request().method() !== 'OPTIONS') {
        console.log('=== RESPONSE ===');
        console.log('STATUS CODE:', res.status());
        try {
          const text = await res.text();
          console.log('RESPONSE BODY:', text);
        } catch (err) {
          console.log('RESPONSE BODY: (Failed to read)', err.message);
        }
      }
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  console.log('Triggering POST /api/teams/request ...');
  await page.evaluate(async () => {
    try {
      await window.hackathonStore.getState().addTeamRequest({
        hackathonId: 'event123',
        title: 'Team Request',
        description: 'Need dev',
        roles: ['Frontend'],
        skills: ['React'],
        createdBy: '6a4d467c2e92bd9586d8352d'
      });
    } catch (e) { }
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Triggering POST /api/teams/join ...');
  await page.evaluate(async () => {
    try {
      await window.hackathonStore.getState().sendJoinRequest('team123', {
        id: '6a4d467c2e92bd9586d8352d',
        name: 'John',
        email: 'john@example.com',
        skills: ['Node'],
        department: 'CS',
        year: '3'
      }, 'I want to join', { role: 'Backend' });
    } catch (e) { }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
  await browser.close();
})();
