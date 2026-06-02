import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5191';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(`${BASE}/#/search`, { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
await page.waitForTimeout(1200);
const m = await page.evaluate(() => {
  const titleBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('골프장 목록'));
  const r = titleBtn.getBoundingClientRect();
  const titleCenter = r.left + r.width/2;
  const screenCenter = window.innerWidth/2;
  return {
    screenW: window.innerWidth,
    titleLeft: Math.round(r.left), titleRight: Math.round(r.right), titleW: Math.round(r.width),
    titleCenter: Math.round(titleCenter), screenCenter: Math.round(screenCenter),
    offsetFromCenter: Math.round(titleCenter - screenCenter),
  };
});
console.log(JSON.stringify(m, null, 2));
await browser.close();
