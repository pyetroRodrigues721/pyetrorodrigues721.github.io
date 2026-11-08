/* 设计一致性对拍：index.html（升级后） vs code.html（设计基准）
   在同一浏览器、同一视口下采样计算样式，逐项比对。 */
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765';

/* 我们的变量名 → code.html 的变量名 */
const VAR_PAIRS = [
  ['--paper', '--paper'],
  ['--paper-2', '--card'],
  ['--ink', '--ink'],
  ['--ink-2', '--ink-soft'],
  /* --ink-3 与 code 的 --muted 已统一为 a11y 达标色 #6f675e，正常配对 */
  ['--ink-3', '--muted'],
  ['--rule', '--line'],
  ['--blue', '--accent'],
  ['--blue-soft', '--accent-soft'],
  ['--btn-fill', '--btn-fill'],
  ['--btn-text', '--btn-text']
];

/* 元素对：[名称, 我们的选择器, code 的选择器, 比对属性] */
const ELEMENT_PAIRS = [
  ['body', 'body', 'body', ['fontFamily', 'backgroundColor', 'color', 'lineHeight']],
  ['h1', 'h1', 'h1', ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight']],
  ['brand', '.brand b', '.brand .name', ['fontFamily', 'fontWeight', 'fontSize']],
  ['nav-link', '.nav a[href="#fields"]', '.nav-links a[href="#fields"]', ['fontFamily', 'fontSize', 'letterSpacing', 'color']],
  ['btn-solid', '.btn--fill', '.btn.solid', ['fontFamily', 'fontSize', 'paddingTop', 'paddingLeft', 'color', 'backgroundColor']],
  ['sec-rule', '.sec-h', '.sec-top', ['borderTopWidth', 'borderTopColor', 'paddingTop']],
  ['card', '.field', '.field', ['borderTopWidth', 'borderTopColor', 'backgroundColor']],
  ['mono-label', '.sec-h .l .mono', '.sec-id', ['fontFamily', 'letterSpacing', 'textTransform']]
];

const DARK_PAIRS = [
  ['--paper', '--paper'], ['--paper-2', '--card'], ['--ink', '--ink'],
  ['--ink-2', '--ink-soft'], ['--ink-3', '--muted'], ['--rule', '--line'],
  ['--blue', '--accent'], ['--blue-soft', '--accent-soft']
];

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const idx = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const cod = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await idx.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await cod.goto(BASE + '/code.html', { waitUntil: 'networkidle' });

  const sample = (page, sel) => page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const out = {};
    ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'color',
     'backgroundColor', 'lineHeight', 'textTransform', 'borderTopWidth',
     'borderTopColor', 'paddingTop', 'paddingLeft'].forEach(p => out[p] = cs[p]);
    /* 字体栈只比对首个（主）字体——回退链是工程细节，不是设计决策 */
    if (out.fontFamily) out.fontFamily = out.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    return out;
  }, sel);

  const readVars = (page, scope) => page.evaluate((sc) => {
    const el = sc === 'body' ? document.body : document.documentElement;
    const cs = getComputedStyle(el);
    const out = {};
    ['--paper', '--paper-2', '--ink', '--ink-2', '--ink-3', '--rule',
     '--blue', '--blue-soft', '--btn-fill', '--btn-text', '--card',
     '--ink-soft', '--muted', '--line', '--accent', '--accent-soft']
      .forEach(n => out[n] = (cs.getPropertyValue(n) || '').trim());
    return out;
  }, scope);

  let pass = true;
  const fails = [];
  const hit = (name, a, c) => {
    const ok = JSON.stringify(a) === JSON.stringify(c);
    if (!ok) { pass = false; fails.push(`${name}: index=${JSON.stringify(a)} code=${JSON.stringify(c)}`); }
    return ok;
  };

  /* 1) 浅色 token */
  const [vIdx, vCod] = [await readVars(idx, 'root'), await readVars(cod, 'root')];
  console.log('=== 浅色 tokens ===');
  for (const [mine, theirs] of VAR_PAIRS) {
    const ok = hit(`token ${mine}`, vIdx[mine], vCod[theirs]);
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${mine} = ${vIdx[mine]}  (code: ${theirs} = ${vCod[theirs]})`);
  }

  /* 2) 元素计算样式 */
  console.log('=== 元素计算样式 ===');
  for (const [name, selMine, selCod, props] of ELEMENT_PAIRS) {
    const [a, c] = [await sample(idx, selMine), await sample(cod, selCod)];
    if (!a || !c) { pass = false; fails.push(`${name}: selector missing (index=${!!a}, code=${!!c})`); console.log(`  FAIL ${name}: selector missing`); continue; }
    const diffs = props.filter(p => a[p] !== c[p]);
    const ok = diffs.length === 0;
    if (!ok) { pass = false; diffs.forEach(p => fails.push(`${name}.${p}: index=${a[p]} code=${c[p]}`)); }
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' → ' + diffs.map(p => `${p}: ${a[p]} vs ${c[p]}`).join('; ')}`);
  }

  /* 3) 颗粒噪点透明度（.grain vs body::after） */
  const grainIdx = await idx.evaluate(() => getComputedStyle(document.querySelector('.grain')).opacity);
  const grainCod = await cod.evaluate(() => getComputedStyle(document.body, '::after').opacity);
  const gOk = hit('grain-opacity', grainIdx, grainCod);
  console.log(`  ${gOk ? 'PASS' : 'FAIL'} grain-opacity = ${grainIdx} (code: ${grainCod})`);

  /* 4) 字体加载 */
  const fontsIdx = await idx.evaluate(() => ({
    mono: document.fonts.check('16px "JetBrains Mono"'),
    serif: document.fonts.check('16px "Noto Serif SC"')
  }));
  const fontsCod = await cod.evaluate(() => ({
    mono: document.fonts.check('16px "JetBrains Mono"'),
    serif: document.fonts.check('16px "Noto Serif SC"')
  }));
  const fOk = hit('fonts-loaded', fontsIdx, fontsCod) && fontsIdx.mono && fontsIdx.serif;
  if (!fOk) pass = false;
  console.log(`  ${fOk ? 'PASS' : 'FAIL'} fonts-loaded = ${JSON.stringify(fontsIdx)} (code: ${JSON.stringify(fontsCod)})`);

  /* a11y：浅色 --ink-3 为满足 WCAG 4.5:1 文本对比度，比 code.html 基准 #837c73 有意加深 */
  const a11y = await idx.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const parse = h => { h = h.trim().replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
    const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const L = rgb => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const l1 = L(parse(cs.getPropertyValue('--ink-3')));
    const l2 = L(parse(cs.getPropertyValue('--paper')));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return { ink3: cs.getPropertyValue('--ink-3').trim(), ratio: Math.round(ratio * 100) / 100 };
  });
  const a11yOk = a11y.ratio >= 4.5;
  if (!a11yOk) pass = false;
  const codeMuted = vCod['--muted'];
  const unified = String(a11y.ink3).toLowerCase() === String(codeMuted).toLowerCase();
  console.log(`  ${a11yOk ? 'PASS' : 'FAIL'} a11y --ink-3 contrast = ${a11y.ratio}:1 (ours ${a11y.ink3} / code ${codeMuted} → ${a11yOk ? (unified ? '达标，两站统一' : '达标，有意偏离基准') : '不达标'})`);

  /* 5) 暗色 token（各自切换属性后比对） */
  await idx.evaluate(() => document.documentElement.setAttribute('data-ink', 'night'));
  await cod.evaluate(() => document.body.setAttribute('data-theme', 'dark'));
  const [dIdx, dCod] = [await readVars(idx, 'root'), await readVars(cod, 'body')];
  console.log('=== 暗色 tokens ===');
  for (const [mine, theirs] of DARK_PAIRS) {
    const ok = hit(`dark ${mine}`, dIdx[mine], dCod[theirs]);
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${mine} = ${dIdx[mine]}  (code: ${theirs} = ${dCod[theirs]})`);
  }
  await idx.evaluate(() => document.documentElement.removeAttribute('data-ink'));
  await cod.evaluate(() => document.body.removeAttribute('data-theme'));

  await b.close();
  if (fails.length) { console.log('=== 差异明细 ==='); fails.forEach(f => console.log('  ' + f)); }
  console.log(pass ? '\nDESIGN CONFORMANCE: ALL PASS' : '\nDESIGN CONFORMANCE: FAILED');
  process.exit(pass ? 0 : 1);
})();
