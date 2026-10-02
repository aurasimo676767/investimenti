const { chromium } = require('C:/Users/simoa/Projects/LocalLead/node_modules/playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
  const out = path.join(__dirname, '..', 'artifacts');
  fs.mkdirSync(out, { recursive: true });
  try {
    for (const [name, size] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(url);
      await page.locator('h1').waitFor();
      if (await page.locator('.demo-banner').count() !== 1) throw new Error(`${name}: demo banner missing`);
      if (name === 'mobile') {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        if (overflow) throw new Error('mobile: horizontal overflow');
      }
      await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
      await page.locator(name === 'desktop' ? '#desktop-nav [data-nav="discover"]' : '#mobile-nav [data-nav="discover"]').click();
      await page.locator('#company-search').fill('iren');
      if (await page.locator('.company-card').count() !== 1) throw new Error(`${name}: search filter failed`);
      if (errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
      await page.close();
    }
    console.log('Browser smoke test passed: desktop, mobile, search, no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
