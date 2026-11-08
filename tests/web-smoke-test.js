const { chromium } = require('playwright');

/* 断言助手：expected 以 "~" 开头表示包含匹配，其余为严格相等 */
function expectCheck(list, name, actual, expected) {
  const ok = typeof expected === 'string' && expected.startsWith('~')
    ? String(actual).includes(expected.slice(1))
    : JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) list.push(`${name}: expect ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

(async () => {
  const errors = [];
  const httpFails = [];
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) httpFails.push(r.status() + ' ' + r.url()); });

  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8765/index.html', { waitUntil: 'networkidle' });

  const r = {};
  r.fieldCards = await page.locator('#fields-wall .field').count();
  r.archiveRows = await page.locator('#archiveBody .row').count();
  r.recentRows = await page.locator('#recent .rrow').count();
  r.counter = await page.locator('#counter').textContent();
  r.brand = await page.locator('header .brand b').textContent();
  r.eyebrow = await page.locator('[data-site="eyebrow"]').textContent();
  r.brandline = await page.locator('[data-site="brandline"]').textContent();
  r.colophonBrand = await page.locator('.colophon [data-site="brand"]').textContent();
  r.colophonSince = await page.locator('.colophon [data-site="since"]').textContent();
  r.githubHref = await page.locator('.foot [data-site-href="github"]').getAttribute('href');
  r.emailHref = await page.locator('.foot [data-site-href="email"]').getAttribute('href');
  r.ariaLabel = await page.locator('header .brand').getAttribute('aria-label');
  r.portholeLink = await page.locator('#pwLink').getAttribute('href');
  r.portholeIframe = await page.locator('#pwFrame iframe').count();

  // searchbox 样式是否真的生效（验证 .search\boxed 转义 bug 已修）
  r.searchboxDisplay = await page.locator('.searchbox').evaluate(el => getComputedStyle(el).display);

  // ── 设计体系断言（对齐 code.html）──
  r.design = await page.evaluate(() => {
    const cs = s => getComputedStyle(document.querySelector(s));
    return {
      bodyFont: cs('body').fontFamily,
      bodyBg: cs('body').backgroundColor,
      navFont: cs('.nav a').fontFamily,
      h1Weight: cs('h1').fontWeight,
      uline: document.querySelectorAll('h1 .uline').length,
      squiggle: document.querySelectorAll('h1 .hand').length,
      legendSpans: document.querySelectorAll('#fields-legend span').length,
      recentCount: document.getElementById('recentCount').textContent,
      kindCount: document.querySelectorAll('#archiveBody .kind').length,
      firstKind: (document.querySelector('#archiveBody .kind') || {}).textContent,
      accentVar: getComputedStyle(document.documentElement).getPropertyValue('--blue').trim(),
      grainOpacity: cs('.grain').opacity,
      fieldBorder: cs('.field').borderTopColor,
      fieldBg: cs('.field').backgroundColor,
      btnFont: cs('.btn--fill').fontFamily,
      secBorder: cs('.sec-h').borderTopColor
    };
  });

  // hover 动效：主按钮 → accent 底色；归档行 → accent-soft 底色
  await page.locator('.intro .btn--fill').hover();
  await page.waitForTimeout(450);
  r.btnHoverBg = await page.locator('.intro .btn--fill').evaluate(el => getComputedStyle(el).backgroundColor);
  await page.locator('#archiveBody .row').first().hover();
  await page.waitForTimeout(450);
  r.rowHoverBg = await page.locator('#archiveBody .row').first().evaluate(el => getComputedStyle(el).backgroundColor);

  // ── 补全区块（按 code.html 移植：作品/方法/技术栈/联系）──
  r.sections = await page.evaluate(() => ({
    featRows: document.querySelectorAll('#featlist .feat').length,
    featFirstHref: (document.querySelector('#featlist .feat') || {}).getAttribute
      ? document.querySelector('#featlist .feat').getAttribute('href') : null,
    steps: document.querySelectorAll('.step').length,
    pillars: document.querySelectorAll('.pillar').length,
    pillarLis: document.querySelectorAll('.pillar li').length,
    navLinks: document.querySelectorAll('.nav a').length,
    contactMail: (document.querySelector('.contact-cta .btn--fill') || {}).href,
    contactGitHub: (document.querySelector('.contact-cta a[target="_blank"]') || {}).href,
    spectrumVals: [...document.querySelectorAll('.sp-val')].map(e => e.textContent.trim()),
    foundationLis: document.querySelectorAll('.foundation li').length
  }));
  // 手风琴：P02 初始收起，点击展开
  await page.locator('.pillar[data-p="p02"] .pillar-head').click();
  await page.waitForTimeout(300);
  r.pillarToggle = await page.locator('.pillar[data-p="p02"]').evaluate(el => ({
    open: el.classList.contains('open'),
    aria: el.querySelector('.pillar-head').getAttribute('aria-expanded')
  }));

  // 筛选交互：点“前端”chip
  await page.locator('#fieldChips .chip[data-f="web"]').click();
  r.filterCounter = await page.locator('#counter').textContent();
  r.filterRows = await page.locator('#archiveBody .row').count();

  // 搜索交互
  await page.locator('#fieldChips .chip[data-f="all"]').click();
  await page.locator('#q').fill('path');
  r.searchCounter = await page.locator('#counter').textContent();

  // 主题切换
  await page.locator('#q').fill('');
  await page.locator('#inkBtn').click();
  r.inkMode = await page.locator('html').getAttribute('data-ink');
  r.inkBtnText = await page.locator('#inkBtn').textContent();
  r.themeColor = await page.locator('#themeColor').getAttribute('content');

  await browser.close();

  const expect = {
    fieldCards: 7, recentRows: 4, portholeIframe: 1,
    counter: '共 30 条 · 当前显示 30 条',
    brand: 'ZeroPhix',
    eyebrow: 'ZeroPhix · 一个人的博客 · 2023 —',
    brandline: 'ZeroPhix · 一个人的博客',
    colophonBrand: 'ZeroPhix',
    colophonSince: '一个人的博客 · 2023—',
    githubHref: 'https://github.com/zerophix',
    emailHref: 'mailto:zerophix@users.noreply.github.com',
    ariaLabel: 'ZeroPhix，回到顶部',
    portholeLink: 'works/01-weather.html',
    searchboxDisplay: 'flex',
    filterCounter: '共 30 条 · 当前显示 7 条',
    filterRows: 7,
    searchCounter: '共 30 条 · 当前显示 1 条',
    inkMode: 'night',
    inkBtnText: '纸张',
    themeColor: '#15140f',
    sections: {
      featRows: 6,
      featFirstHref: 'works/01-weather.html',
      steps: 4,
      pillars: 4,
      pillarLis: 44,
      navLinks: 6,
      contactMail: 'mailto:zerophix@users.noreply.github.com',
      contactGitHub: 'https://github.com/zerophix',
      spectrumVals: ['13 项', '9 项', '12 项', '10 项'],
      foundationLis: 8
    },
    pillarToggle: { open: true, aria: 'true' }
  };

  // 设计体系断言（~ 前缀 = 包含）
  const designFails = [];
  expectCheck(designFails, 'bodyFont', r.design.bodyFont, '~Noto Serif SC');
  expectCheck(designFails, 'bodyBg', r.design.bodyBg, 'rgb(240, 237, 230)');
  expectCheck(designFails, 'navFont', r.design.navFont, '~JetBrains Mono');
  expectCheck(designFails, 'btnFont', r.design.btnFont, '~JetBrains Mono');
  expectCheck(designFails, 'h1Weight', r.design.h1Weight, '900');
  expectCheck(designFails, 'uline', r.design.uline, 1);
  expectCheck(designFails, 'squiggle-removed', r.design.squiggle, 0);
  expectCheck(designFails, 'legendSpans', r.design.legendSpans, 4);
  expectCheck(designFails, 'recentCount', r.design.recentCount, '04 条');
  expectCheck(designFails, 'kindCount', r.design.kindCount, 30);
  expectCheck(designFails, 'firstKind', r.design.firstKind, '我写的');
  expectCheck(designFails, 'accentVar', r.design.accentVar, '#27457e');
  expectCheck(designFails, 'grainOpacity', r.design.grainOpacity, '0.05');
  expectCheck(designFails, 'fieldBorder', r.design.fieldBorder, 'rgb(214, 208, 196)');
  expectCheck(designFails, 'fieldBg', r.design.fieldBg, 'rgb(246, 244, 239)');
  expectCheck(designFails, 'secBorder', r.design.secBorder, 'rgb(27, 25, 23)');
  expectCheck(designFails, 'btnHoverBg', r.btnHoverBg, 'rgb(39, 69, 126)');
  expectCheck(designFails, 'rowHoverBg', r.rowHoverBg, 'rgba(39, 69, 126, 0.1)');
  r.designFails = designFails;
  expect.designFails = [];

  let pass = true;
  console.log('=== 实测 ===');
  for (const [k, v] of Object.entries(r)) console.log(`  ${k} = ${JSON.stringify(v)}`);
  console.log('=== 断言 ===');
  for (const [k, v] of Object.entries(expect)) {
    const ok = JSON.stringify(r[k]) === JSON.stringify(v);
    if (!ok) pass = false;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${k}: expect ${JSON.stringify(v)}, got ${JSON.stringify(r[k])}`);
  }
  if (designFails.length) {
    pass = false;
    console.log('=== 设计断言失败 ===');
    designFails.forEach(f => console.log('  FAIL ' + f));
  } else {
    console.log(`  PASS designChecks: 18 项全部通过`);
  }

  // works/* 若缺失记为已知缺口，不算代码失败
  const known = [], fatal = [];
  errors.forEach(e => {
    if (/Failed to load resource.*404/.test(e)) known.push(e);
    else fatal.push(e);
  });
  httpFails.forEach(u => {
    if (/\/works\//.test(u)) known.push('404 known-gap: ' + u);
    else fatal.push('http fail: ' + u);
  });

  if (fatal.length) { pass = false; console.log('=== 运行时错误 ==='); fatal.forEach(e => console.log('  ' + e)); }
  else console.log('=== 无运行时错误 ===');
  if (known.length) { console.log('=== 已知缺口 ==='); known.forEach(e => console.log('  ' + e)); }
  console.log(pass ? '\nALL PASS' : '\nFAILED');
  process.exit(pass ? 0 : 1);
})();
