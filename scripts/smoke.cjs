let playwright;
try { playwright = require('playwright'); } catch (_) { playwright = require('C:/Users/simoa/Projects/LocalLead/node_modules/playwright'); }
const { chromium } = playwright;
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
  const out = path.join(__dirname, '..', 'artifacts');
  fs.mkdirSync(out, { recursive: true });
  try {
    for (const [name, size] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['small-mobile', { width: 360, height: 800 }], ['tablet', { width: 768, height: 1024 }]]) {
      const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(url);
      await page.locator('h1').waitFor();
      if (await page.locator('.demo-banner').count() !== 0) throw new Error(`${name}: unexpected demo banner`);
      if (size.width < 800) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        if (overflow) throw new Error('mobile: horizontal overflow');
      }
      await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
      const nav = size.width <= 640 ? '#mobile-nav' : '#desktop-nav';
      await page.locator(`${nav} [data-nav="discover"]`).click();
      await page.locator('#company-search').fill('iren');
      if (await page.locator('.company-card').count() !== 1) throw new Error(`${name}: search filter failed`);
      for (const id of ['watchlist','lab','transactions','settings']) {
        await page.locator(`${nav} [data-nav="${id}"]`).click();
        await page.locator('h1').waitFor();
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error(`${name}: ${id} horizontal overflow`);
        await page.screenshot({ path: path.join(out, `${name}-${id}.png`), fullPage: true });
      }
      if (errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
      await page.close();
    }
    console.log('Browser smoke test passed: desktop, mobile, search, no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
