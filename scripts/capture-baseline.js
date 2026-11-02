const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'baseline');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'portfolio', path: '/portfolio' },
  { name: 'session-weddings', path: '/portfolio/weddings' },
  { name: 'services', path: '/services' },
  { name: 'service-weddings', path: '/services/weddings' },
  { name: 'style', path: '/style' },
  { name: 'contact', path: '/contact' },
  { name: 'book', path: '/book' },
  { name: 'terms', path: '/terms' },
  { name: 'privacy', path: '/privacy' },
];

async function capture() {
  console.log('Launching browser (msedge channel)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const baseUrl = 'http://localhost:3000';

  for (const vp of VIEWPORTS) {
    console.log(`\nCapturing viewports at ${vp.width}px (${vp.name})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      const url = `${baseUrl}${p.path}`;
      const filename = `${p.name}-${vp.width}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      console.log(`  -> Navigating to ${url} ...`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        // Give animations and lazy images a moment to stabilize
        await page.waitForTimeout(2000);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`  ✓ Saved ${filename}`);
      } catch (err) {
        console.error(`  ✗ Error capturing ${p.name} at ${vp.width}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nAll baseline screenshots captured successfully in docs/baseline/');
}

capture().catch((err) => {
  console.error('Fatal error capturing baseline:', err);
  process.exit(1);
});
