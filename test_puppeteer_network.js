import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.url().includes('/api/teams/')) {
      console.log('--- REQUEST ---');
      console.log('URL:', request.url());
      console.log('METHOD:', request.method());
      console.log('HEADERS:', request.headers());
      console.log('PAYLOAD:', request.postData());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/teams/')) {
      console.log('--- RESPONSE ---');
      console.log('STATUS:', response.status());
      try {
        const text = await response.text();
        console.log('BODY:', text);
      } catch (err) {
        console.log('BODY ERROR:', err.message);
      }
    }
  });

  // Since we don't know the UI flow, let's inject a script into the page that uses window.fetch or axios to hit the endpoint EXACTLY how the frontend does, or we can just wait for manual interaction.
  // Actually, wait. Let's just expose a global in the React app so we can trigger it.
})();
