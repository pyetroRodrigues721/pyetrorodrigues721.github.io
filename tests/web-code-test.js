const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765';

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [], bad = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });

  const resp = await page.goto(BASE + '/code.html', { waitUntil: 'networkidle' });
  const r = { status: resp.status() };

  // ── 链接审计 ──
  r.links = await page.evaluate(() => {
    const out = { hash: [], rel: [], ext: [], mailto: [], hashBroken: [], placeholder: [] };
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (h === '#' || h === '') out.placeholder.push(a.textContent.trim().slice(0, 16));
      else if (h.startsWith('#')) { out.hash.push(h); if (!document.getElementById(h.slice(1))) out.hashBroken.push(h); }
      else if (/^https?:/.test(h)) out.ext.push(h);
      else if (h.startsWith('mailto:')) out.mailto.push(h);
      else out.rel.push(h);
    });
    return out;
  });
  r.relStatus = {};
  for (const h of [...new Set(r.links.rel)]) {
    const u = new URL(h, BASE + '/code.html'); u.hash = '';
    r.relStatus[h] = (await page.request.get(u.toString())).status();
  }

  // ── SEO ──
  r.seo = await page.evaluate(() => ({
    canonical: (document.querySelector('link[rel=canonical]') || {}).href,
    ogImage: (document.querySelector('meta[property="og:image"]') || {}).content,
    themeColor: (document.querySelector('meta[name=theme-color]') || {}).content,
    jsonLd: !!document.querySelector('script[type="application/ld+json"]')
  }));

  // ── doc 行非链接化 + 待发布 ──
  r.doc = await page.evaluate(() => ({
    linkDocs: document.querySelectorAll('a.doc').length,
    docs: document.querySelectorAll('.doc').length,
    pending: [...document.querySelectorAll('.doc .go')].every(g => g.textContent.trim() === '待发布')
  }));

  // ── 导航互通 ──
  r.nav = await page.evaluate(() => ({
    brandHome: document.querySelector('.brand').getAttribute('href'),
    homeLink: [...document.querySelectorAll('.nav-links a')].some(a => a.getAttribute('href') === '../index.html')
  }));

  // ── 主题：初始亮 → 切暗 → 切回亮（双键同步）──
  r.theme0 = await page.evaluate(() => document.body.dataset.theme || 'light');
  await page.locator('#themeBtn').click(); await page.waitForTimeout(200);
  r.theme1 = await page.evaluate(() => ({
    dark: document.body.dataset.theme === 'dark',
    zpInk: localStorage.getItem('zp-ink'),
    legacy: localStorage.getItem('theme'),
    meta: document.getElementById('themeColor').getAttribute('content'),
    btn: document.getElementById('themeBtn').textContent
  }));
  await page.locator('#themeBtn').click(); await page.waitForTimeout(200);
  r.theme2 = await page.evaluate(() => ({ dark: document.body.dataset.theme === 'dark', zpInk: localStorage.getItem('zp-ink') }));

  // ── 从首页带来的夜读状态 ──
  await page.evaluate(() => localStorage.setItem('zp-ink', 'night'));
  await page.reload({ waitUntil: 'networkidle' });
  r.themeFromHome = await page.evaluate(() => document.body.dataset.theme === 'dark');
  await page.evaluate(() => localStorage.setItem('zp-ink', 'paper'));
  /* 切回明态再做 axe：否则对比度检查会在暗色下进行（状态泄漏） */
  await page.reload({ waitUntil: 'networkidle' });

  // ── 首页 → code.html 互链 ──
  const home = await b.newPage();
  await home.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  r.homeLink = await home.evaluate(() => !!document.querySelector('a[href="code.html"]'));
  await home.close();

  // ── sitemap 收录 ──
  r.sitemap = await page.evaluate(async () =>
    (await (await fetch('/sitemap.xml')).text()).includes('/code.html'));

  // ── axe 可访问性 ──
  let axeV = 'inject failed';
  try {
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    await page.waitForFunction(() => !!window.axe);
    axeV = await page.evaluate(async () => {
      const res = await window.axe.run(document, { resultTypes: ['violations'] });
      return res.violations.map(v => ({
        id: v.id, impact: v.impact, nodes: v.nodes.length,
        target: (v.nodes[0] && v.nodes[0].target || []).join(' ')
      }));
    });
  } catch (e) { axeV = 'axe error: ' + e.message; }
  r.axe = axeV;
  r.consoleErrors = errors;
  r.badResponses = bad;

  await b.close();

  // ── 断言 ──
  const fails = [];
  const ck = (n, ok, detail) => { if (!ok) fails.push(`${n}${detail ? ' → ' + detail : ''}`); };
  ck('status200', r.status === 200, r.status);
  ck('no-placeholder-href', r.links.placeholder.length === 0, JSON.stringify(r.links.placeholder));
  ck('no-broken-hash', r.links.hashBroken.length === 0, JSON.stringify(r.links.hashBroken));
  ck('rel-links-200', Object.values(r.relStatus).every(s => s === 200), JSON.stringify(r.relStatus));
  ck('github-link', r.links.ext.includes('https://github.com/zerophix'), JSON.stringify(r.links.ext));
  ck('mailto-real', r.links.mailto.includes('mailto:zerophix@users.noreply.github.com'), JSON.stringify(r.links.mailto));
  ck('nav-home', r.nav.brandHome === '../index.html' && r.nav.homeLink, JSON.stringify(r.nav));
  ck('doc-nonlink', r.doc.linkDocs === 0 && r.doc.docs === 8 && r.doc.pending, JSON.stringify(r.doc));
  ck('canonical', r.seo.canonical === 'https://zerophix.github.io/code.html', r.seo.canonical);
  ck('og-image', r.seo.ogImage === 'https://zerophix.github.io/og-code.png', r.seo.ogImage);
  ck('jsonld', r.seo.jsonLd === true);
  ck('theme-init-light', r.theme0 === 'light', r.theme0);
  ck('theme-toggle', r.theme1.dark && r.theme1.zpInk === 'night' && r.theme1.legacy === 'dark' &&
    r.theme1.meta === '#15140f' && r.theme1.btn === '日 读', JSON.stringify(r.theme1));
  ck('theme-restore', r.theme2.dark === false && r.theme2.zpInk === 'paper', JSON.stringify(r.theme2));
  ck('theme-from-home', r.themeFromHome === true);
  ck('home-links-code', r.homeLink === true);
  ck('sitemap-has-code', r.sitemap === true);
  ck('no-console-errors', errors.length === 0, JSON.stringify(errors));
  ck('no-bad-responses', bad.length === 0, JSON.stringify(bad));
  ck('axe-0', Array.isArray(axeV) && axeV.length === 0, JSON.stringify(axeV));

  console.log('=== 实测 ===');
  for (const [k, v] of Object.entries(r)) console.log(`  ${k} = ${JSON.stringify(v)}`);
  console.log('=== 断言 ===');
  if (fails.length) { fails.forEach(f => console.log('  FAIL ' + f)); console.log('\nFAILED'); }
  else console.log(`  ALL ${23} PASS`);
  console.log(fails.length ? '' : '\nALL PASS');
  process.exit(fails.length ? 1 : 0);
})();
