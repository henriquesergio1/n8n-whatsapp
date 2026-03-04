const { chromium } = require('playwright');

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i+1] && !process.argv[i+1].startsWith('--')
    ? process.argv[i+1] : def;
}
function flag(name){ return process.argv.includes(`--${name}`); }

(async () => {
  const url = arg('url');
  const out = arg('out');
  const width = parseInt(arg('width', '1000'), 10);
  const height = parseInt(arg('height', '5200'), 10);
  const dpr = parseFloat(arg('dpr', '2'));      // 2 = HD (pode usar 3)
  const wait = parseInt(arg('wait', '10000'), 10);
  const selector = arg('selector', null);
  const fullPage = flag('fullpage');

  if(!url || !out){
    console.error('❌ Falta --url e/ou --out'); process.exit(2);
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']
    });

    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      timezoneId: 'America/Sao_Paulo',
      locale: 'pt-BR',
    });

    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    if (selector) await page.waitForSelector(selector, { state: 'visible', timeout: 120000 });
    if (wait>0) await page.waitForTimeout(wait);

    await page.screenshot({ path: out, fullPage: !!fullPage, type: 'png' });
    console.log('✅ PNG salvo em:', out);
    await browser.close(); process.exit(0);
  } catch (e) {
    console.error('❌ Erro na captura:', e?.message || e);
    if (browser) await browser.close(); process.exit(1);
  }
})();
