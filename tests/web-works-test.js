const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765';

const EXPECT = {
  '01-weather': '天气页：让温度退到角落',
  '02-diary': '会变色的日记本',
  '03-relation': '读书关系图',
  '04-toast-lamp': '提示灯',
  '05-about': '给自己做的一页',
  '06-week': '一周时间表'
};

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  let pass = true;
  for (const [slug, title] of Object.entries(EXPECT)) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = [], bad = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });

    const resp = await p.goto(`${BASE}/works/${slug}.html`, { waitUntil: 'networkidle' });
    const info = await p.evaluate(() => ({
      h1: document.querySelector('h1').textContent.trim(),
      bg: getComputedStyle(document.body).backgroundColor,
      cssLoaded: getComputedStyle(document.querySelector('.mast')).position === 'sticky',
      backHome: document.querySelector('a.btn--fill').getAttribute('href'),
      hasTodo: document.body.innerText.includes('TODO'),
      desc: (document.querySelector('meta[name=description]') || {}).content || '',
      noJsNeeded: !document.querySelector('script[src]')
    }));
    const ok = resp.status() === 200 && info.h1 === title && info.cssLoaded &&
      info.bg === 'rgb(240, 237, 230)' && info.backHome === '../index.html#archive' &&
      info.hasTodo && info.noJsNeeded && !errs.length && !bad.length;
    if (!ok) pass = false;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${slug} | status=${resp.status()} h1="${info.h1}" bg=${info.bg} css=${info.cssLoaded} todo=${info.hasTodo} noExternalJs=${info.noJsNeeded} errors=${errs.length} bad=${bad.length}`);
    await p.close();
  }
  await b.close();
  console.log(pass ? '\nALL PLACEHOLDERS PASS' : '\nFAILED');
  process.exit(pass ? 0 : 1);
})();
