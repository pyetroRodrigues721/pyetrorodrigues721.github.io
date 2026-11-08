/* 一次性生成器：为 data.js 中 6 个带 u 的条目生成占位页（保持站点风格） */
const fs = require('fs');
const OUT = '/Users/mingxilv/vibecoding/web/works';

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%23f0ede6'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='21' font-weight='700' fill='%2327457e' text-anchor='middle'%3EZ%3C/text%3E%3C/svg%3E";

const PAGES = [
  { slug:'01-weather', title:'天气页：让温度退到角落', name:'前端', en:'Frontend', no:'V01', date:'2025.03', type:'我做的',
    s:'今天适合出门，比 23°C 更重要。把数字缩小一半挪到右下角，页面才开始说话。' },
  { slug:'02-diary', title:'会变色的日记本', name:'设计', en:'Design', no:'V02', date:'2024.12', type:'我做的',
    s:'背景跟着写下的心情走。这是我第一次觉得变量是有情绪的。' },
  { slug:'03-relation', title:'读书关系图', name:'读书', en:'Reading', no:'V05', date:'2025.01', type:'我做的',
    s:'把一年读过的书画成一张可以点的图，看得出哪些书其实是一本。' },
  { slug:'04-toast-lamp', title:'提示灯', name:'工具', en:'Tools', no:'V03', date:'2024.12', type:'我做的',
    s:'一个会发光的小提示器。它不阻止你，只是把灯打开，让你自己决定。' },
  { slug:'05-about', title:'给自己做的一页', name:'前端', en:'Frontend', no:'V01', date:'2024.11', type:'我做的',
    s:'没有大段自我介绍，只有几行事实和一块会动的网格。' },
  { slug:'06-week', title:'一周时间表', name:'工具', en:'Tools', no:'V03', date:'2025.02', type:'我做的',
    s:'自己用的小工具，做了三版。需要的不是更精细的格子，而是更诚实的空格。' }
];

function esc(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function page(p){
  const desc = `${p.s} —— ZeroPhix · ${p.name}分册。`;
  return `<!DOCTYPE html>
<html lang="zh-CN" data-ink="paper">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} · ZeroPhix</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#f0ede6">
<link rel="icon" href="${FAVICON}">
<script>document.documentElement.classList.add('js');</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css">
<style>
.work{padding:clamp(46px,7vw,104px) 0 clamp(56px,8vw,110px)}
.work h1{max-width:20ch}
.work .lead{max-width:54ch}
.work .body{margin-top:clamp(28px,4vw,44px);font-size:15.5px;line-height:2.05;
  color:var(--ink-2);max-width:46ch}
.todo{margin-top:clamp(30px,4vw,48px);border-top:1.5px solid var(--ink);padding-top:16px;
  display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  font-family:var(--mono);font-size:9.5px;letter-spacing:.22em;
  color:var(--ink-3);text-transform:uppercase}
</style>
</head>
<body>

<div class="grain" aria-hidden="true"></div>

<header class="mast">
  <div class="wrap mast-in">
    <a class="brand" href="../index.html" aria-label="ZeroPhix，回到首页">
      <b>ZeroPhix</b><span class="tag">Personal Blog</span>
    </a>
    <nav class="nav" aria-label="返回导航">
      <a href="../index.html#fields">领域</a>
      <a href="../index.html#archive">归档</a>
    </nav>
    <div class="mast-right"><span class="mono">占位页 / Placeholder</span></div>
  </div>
</header>

<main class="wrap work" id="top">

  <div class="eyebrow">
    <span class="ln" aria-hidden="true"></span>
    <span class="mono">${esc(p.no)} · ${esc(p.en)} · ${esc(p.date)} · ${esc(p.type)}</span>
  </div>

  <h1><span class="ln"><i>${esc(p.title)}</i></span></h1>

  <p class="lead">${esc(p.s)}</p>

  <div class="acts">
    <a class="btn btn--fill" href="../index.html#archive">
      回到归档
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <a class="btn btn--ghost" href="../index.html">首页</a>
  </div>

  <div class="todo">
    <span>TODO · 正文待写</span>
    <span>分册：${esc(p.name)} / ${esc(p.en)}</span>
  </div>

  <p class="body">
    这一页的位置已经留好，正文还没写。写完之后把这段和上面的 TODO 条删掉即可——
    归档里那条记录一直链接到这里，不用再改。
  </p>

</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot-in">
      <div class="foot-links">
        <a href="../index.html#fields">领域 / Fields</a>
        <a href="../index.html#archive">归档 / Archive</a>
        <a href="../index.html#top">回到顶部 / Top</a>
      </div>
      <p class="mono" style="margin:0">ZeroPhix · 一个人的博客</p>
    </div>
  </div>
</footer>

</body>
</html>
`;
}

let n = 0;
for (const p of PAGES) {
  fs.writeFileSync(`${OUT}/${p.slug}.html`, page(p));
  n++;
}
console.log(`generated ${n} placeholder pages in ${OUT}`);
