import puppeteer from 'puppeteer';

const BASE = 'http://localhost:3000';
const OUT  = './public/screenshots';

const MOCK_REPORT = {
  overall_score: 58,
  overall_label: 'Needs Work',
  summary_headline: 'Your pipeline has structure, but gaps in attribution and data hygiene are costing you visibility — and revenue.',
  categories: {
    pipeline_stage_design: {
      score: 72, label: 'Good',
      findings: ['Stages follow buyer actions but renewal pipeline is mixed with new business.', 'Loss reasons are logged inconsistently, limiting post-mortem analysis.'],
      arr_impact: 'Estimated 8–12% of ARR at risk annually from misclassified pipeline stages.',
    },
    lead_source_attribution: {
      score: 38, label: 'High Risk',
      findings: ['Lead source is captured manually — compliance is below 60%.', 'No saved report ties source to closed-won revenue.'],
      arr_impact: 'Without clean attribution, 20–30% of marketing spend is unaccountable.',
    },
    data_completeness: {
      score: 55, label: 'Needs Work',
      findings: ['Key fields lack validation rules — reps can save with blank close dates.', 'Stale close dates inflate pipeline by an estimated 25%.'],
      arr_impact: 'Inflated pipeline leads to forecast errors averaging $400K–$800K per quarter.',
    },
    reporting_architecture: {
      score: 60, label: 'Needs Work',
      findings: ['QoQ pipeline reports require manual rebuilds.', 'Weekly reviews rely on exported spreadsheets, not live CRM data.'],
      arr_impact: 'Leadership decisions lag by 1–2 weeks — costing deals in the 11th hour.',
    },
    revenue_leakage: {
      score: 65, label: 'Good',
      findings: ['Renewal pipeline exists but is mixed with new business.', 'Discounts are not logged at the deal level.'],
      arr_impact: 'Estimated 5–10% NRR leakage from untracked churn and discount patterns.',
    },
  },
  top_3_fixes: [
    { rank: 1, title: 'Enforce Lead Source via UTM + Required Field', description: 'Connect your marketing UTM parameters to a locked CRM field. One-time setup eliminates manual entry and instantly improves attribution accuracy.', effort: 'Low', impact: 'High' },
    { rank: 2, title: 'Add Validation Rules for Close Date and Deal Value', description: 'Block saving an opportunity without a close date and deal value. Removes stale pipeline within 30 days without manager intervention.', effort: 'Low', impact: 'High' },
    { rank: 3, title: 'Separate Renewal Pipeline with Dedicated Stages', description: 'Create a parallel pipeline for renewals and expansions with its own stage gates and owner field. Gives NRR its own forecast lane.', effort: 'Medium', impact: 'High' },
  ],
};

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✓ ${name}.png`);
}

// ── 1. Landing ────────────────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1');
  await shot(page, 'landing');
  await page.close();
}

// ── 2. Q1 (audit form) ────────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE}/audit`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h2');
  await shot(page, 'audit');
  await page.close();
}

// ── 3. Q10 ────────────────────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE}/audit`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h2');

  // Click through Q1–Q9 (pick first button each time, wait for re-render)
  for (let i = 0; i < 9; i++) {
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    await buttons[0].click();
    await new Promise(r => setTimeout(r, 450));
  }

  await page.waitForSelector('h2');
  await shot(page, 'q10');
  await page.close();
}

// ── 4. Stack / ARR step (metadata) ────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE}/audit`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h2');

  // Click through all 10 questions
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    await buttons[0].click();
    await new Promise(r => setTimeout(r, 450));
  }

  // Now on metadata step — click HubSpot and 51-200
  await page.waitForSelector('form');
  const crmButtons = await page.$$('button[type="button"]');
  for (const btn of crmButtons) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt === 'HubSpot') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 200));
  const allButtons = await page.$$('button[type="button"]');
  for (const btn of allButtons) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt === '51–200') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 200));
  const arrButtons = await page.$$('button[type="button"]');
  for (const btn of arrButtons) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt === '$1M–$5M') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 200));

  await shot(page, 'stack');
  await page.close();
}

// ── 5. Report (mock API) ──────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Intercept /api/audit and return mock report
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('/api/audit')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ report: MOCK_REPORT }),
      });
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE}/audit`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h2');

  // Click through all 10 questions
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    await buttons[0].click();
    await new Promise(r => setTimeout(r, 450));
  }

  // Fill metadata
  await page.waitForSelector('form');
  const crmBtns = await page.$$('button[type="button"]');
  for (const btn of crmBtns) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt === 'HubSpot') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 150));
  const sizeBtns = await page.$$('button[type="button"]');
  for (const btn of sizeBtns) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt === '51–200') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 150));

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();

  // Email capture screen
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.type('input[type="email"]', 'demo@example.com');
  const emailSubmit = await page.$('button[type="submit"]');
  await emailSubmit.click();

  // Wait for report — poll for the score ring or report title
  await page.waitForSelector('.animate-spin', { timeout: 3000 }).catch(() => {});
  await page.waitForFunction(
    () => document.body.innerText.includes('RevOps Audit Report'),
    { timeout: 10000 }
  );
  await new Promise(r => setTimeout(r, 1000));
  await shot(page, 'report');
  await page.close();
}

await browser.close();
console.log('All screenshots saved to public/screenshots/');
