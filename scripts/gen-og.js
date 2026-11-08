/* 生成分享卡片 og.png（1200×630），沿用升级后的设计语言（code.html 风格） */
const { chromium } = require('playwright');

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%23f0ede6'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='21' font-weight='700' fill='%2327457e' text-anchor='middle'%3EZ%3C/text%3E%3C/svg%3E";

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<link rel="icon" href="${FAVICON}">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:630px;background:#f0ede6;color:#1b1917;
    font-family:'Noto Serif SC',serif;line-height:1.85;
    padding:64px 76px 56px;display:flex;flex-direction:column;position:relative;overflow:hidden}
  .rule{height:1px;background:#1b1917;width:100%}
  .head{display:flex;justify-content:space-between;align-items:baseline;
    padding-bottom:22px}
  .brand{font-weight:900;font-size:34px;letter-spacing:.02em}
  .tag{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.32em;
    color:#837c73;text-transform:uppercase}
  .mid{flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 0}
  .foot{display:flex;justify-content:space-between;align-items:baseline;
    padding-top:22px;border-top:1px solid #d6d0c4}
  .url{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:.14em;color:#27457e}
  .grain{position:absolute;inset:0;pointer-events:none;opacity:.05;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
</style>
</head>
<body>
  <div class="grain"></div>
  <div class="head">
    <span class="brand">ZeroPhix</span>
    <span class="tag">Personal Blog · 2023 —</span>
  </div>
  <div class="rule"></div>
  <div class="mid"></div>
  <div class="foot">
    <span class="url">zerophix.github.io</span>
  </div>
</body>
</html>`;

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/Users/mingxilv/vibecoding/web/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await b.close();
  console.log('og.png written');
})();
