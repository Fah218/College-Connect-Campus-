const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(msg.text());
  });

  await page.goto('http://localhost:5173/explore-events', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
