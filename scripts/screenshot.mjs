import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT  = './public/screenshots';

const pages = [
  { name: 'landing',  url: BASE,         waitFor: 'h1' },
  { name: 'audit',    url: `${BASE}/audit`, waitFor: 'form, [data-testid]' },
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

for (const { name, url, waitFor } of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  try { await page.waitForSelector(waitFor, { timeout: 5000 }); } catch {}
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✓ ${name}.png`);
  await page.close();
}

await browser.close();
