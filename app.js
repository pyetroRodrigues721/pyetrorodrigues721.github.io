/* ============================================================
   ZeroPhix · 行为层
   从 data.js（window.ZP）取数据，填充 index.html 模板。
   ============================================================ */
(function(){
"use strict";

var ZP   = window.ZP || {};
var SITE = ZP.site  || {};
var FIELDS = ZP.fields || [];
/* 挂载页（pages/ 经 Eleventy 生成的 mounted.js）与手写条目合并，
   归档、领域计数、最近更新、筛选器因此自动收录挂载页 */
var MOUNT = (window.ZP_MOUNT && window.ZP_MOUNT.pages) || [];
var ITEMS  = (ZP.items || []).concat(MOUNT);

var TYPE = {
  w:{label:'我写的', short:'写', en:'Articles'},
  p:{label:'我做的', short:'做', en:'Projects'},
  t:{label:'我试的', short:'试', en:'Experiments'},
  c:{label:'对话',   short:'聊', en:'Dialogues'}
};

/* ─── helpers ─── */
function esc(s){
  return String(s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function $(id){ return document.getElementById(id); }
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fieldOf(id){
  for (var i=0;i<FIELDS.length;i++) if (FIELDS[i].id === id) return FIELDS[i];
  return {id:id, no:'V--', name:id, en:id, desc:''};
}

/* ═══════════════════════════════════════════════
   模板填充 ①：站点信息
   把 data.js 里 site 的值灌进带 data-site 的占位元素。
   占位元素在模板里写了默认文案，data.js 缺项时不覆盖。
   ═══════════════════════════════════════════════ */
function fillSite(){
  var txt = {
    brand:    SITE.brand,
    aria:     SITE.brand ? SITE.brand + '，回到顶部' : null,
    eyebrow:  (SITE.brand && SITE.since)
              ? SITE.brand + ' · ' + (SITE.tagline || '') + ' · ' + SITE.since + ' —'
              : null,
    brandline:(SITE.brand && SITE.tagline) ? SITE.brand + ' · ' + SITE.tagline : null,
    since:    (SITE.tagline && SITE.since) ? SITE.tagline + ' · ' + SITE.since + '—' : null
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-site]'), function(el){
    var k = el.getAttribute('data-site');
    var v = (k in txt) ? txt[k] : null;
    if (v == null || v === '') return;
    if (k === 'aria') el.setAttribute('aria-label', v);
    else el.textContent = v;
  });

  var href = {
    github: SITE.github,
    email: SITE.email
      ? (/^mailto:/i.test(SITE.email) ? SITE.email : 'mailto:' + SITE.email)
      : null
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-site-href]'), function(el){
    var v = href[el.getAttribute('data-site-href')];
    if (v) el.setAttribute('href', v);
  });
}

/* ───────── 主题 ───────── */
var root = document.documentElement, inkBtn = $('inkBtn');
function setInk(v){
  root.setAttribute('data-ink', v);
  inkBtn.setAttribute('aria-pressed', v === 'night' ? 'true' : 'false');
  inkBtn.textContent = v === 'night' ? '纸张' : '夜读';
  /* 同步手机浏览器地址栏颜色 */
  var tc = $('themeColor');
  if (tc) tc.setAttribute('content', v === 'night' ? '#15140f' : '#f0ede6');
  try{ localStorage.setItem('zp-ink', v); }catch(e){}
}
var savedInk = null; try{ savedInk = localStorage.getItem('zp-ink'); }catch(e){}
setInk(savedInk === 'night' ? 'night' : 'paper');
inkBtn.addEventListener('click', function(){
  setInk(root.getAttribute('data-ink') === 'night' ? 'paper' : 'night');
});

/* ───────── 菜单 ───────── */
var menuBtn = $('menuBtn'), nav = $('nav');
menuBtn.addEventListener('click', function(){
  var open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuBtn.textContent = open ? '关闭' : '菜单';
});
nav.addEventListener('click', function(e){
  if (e.target.closest('a')){
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.textContent = '菜单';
  }
});

/* ───────── 活体小窗 ───────── */
/* 注意：thumbIO 必须在下面的 buildPorthole() 调用之前初始化，
   否则 var 声明的初始化语句会在观察器创建之后把它重置为 null，
   导致 IntersectionObserver 回调里 unobserve 抛错。 */
var thumbIO = null;
(function buildPorthole(){
  /* 取第一条带 live:1 且有链接的条目；没有则取第一条有链接的 */
  var liveItems = ITEMS.filter(function(x){ return x.live && x.u; });
  var it = liveItems[0] || ITEMS.filter(function(x){ return x.u; })[0];
  var frame = $('pwFrame');
  if (it && it.u){
    frame.insertAdjacentHTML('afterbegin',
      '<iframe title="预览：' + esc(it.t) + '" data-src="' + esc(it.u) +
      '" scrolling="no" loading="lazy"></iframe>');
    var tile = frame.querySelector('.tile .big');
    if (tile) tile.textContent = it.t;
    $('pwLink').setAttribute('href', it.u);
    loadThumbs(frame);
  }
})();

function scaleThumbs(){
  Array.prototype.forEach.call(document.querySelectorAll('.pw-frame'), function(t){
    t.style.setProperty('--s', (t.clientWidth / 1200).toFixed(4));
  });
}
function loadThumbs(scope){
  var frames = Array.prototype.slice.call(
    (scope || document).querySelectorAll('iframe[data-src]'));
  if (!frames.length){ scaleThumbs(); return; }
  if ('IntersectionObserver' in window){
    if (!thumbIO){
      thumbIO = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){
            var f = e.target;
            if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src'));
            thumbIO.unobserve(f);
          }
        });
      }, { rootMargin:'500px 0px' });
    }
    frames.forEach(function(f){ thumbIO.observe(f); });
  } else {
    frames.forEach(function(f){ f.setAttribute('src', f.getAttribute('data-src')); });
  }
  scaleThumbs();
}
if ('ResizeObserver' in window){ new ResizeObserver(scaleThumbs).observe(document.body); }
else { window.addEventListener('resize', scaleThumbs); }

/* ───────── 最近更新 ───────── */
(function buildRecent(){
  var top = ITEMS.slice().sort(function(a,b){
    return (b.date||'').localeCompare(a.date||'');
  }).slice(0,4);
  var rc = $('recentCount');
  if (rc) rc.textContent = String(top.length).padStart(2,'0') + ' 条';
  $('recent').innerHTML = top.map(function(it){
    var f = fieldOf(it.f);
    var inner =
      '<time>' + esc(it.date) + '</time>' +
      '<span class="t">' + esc(it.t) +
      '<span class="f">' + esc(f.name) + '</span></span>';
    return it.u
      ? '<a class="rrow" href="' + esc(it.u) + '">' + inner + '</a>'
      : '<div class="rrow rrow--plain">' + inner + '</div>';
  }).join('');
})();

/* ───────── 领域墙 ───────── */
(function buildWall(){
  $('fields-wall').innerHTML = FIELDS.map(function(f, i){
    var list = ITEMS.filter(function(it){ return it.f === f.id; });
    var counts = {w:0, p:0, t:0, c:0};
    list.forEach(function(it){ if (counts[it.type] !== undefined) counts[it.type]++; });
    var total = list.length;
    var latest = list.slice().sort(function(a,b){
      return (b.date||'').localeCompare(a.date||'');
    })[0];

    var bar = ['w','p','t','c'].map(function(k){
      return counts[k]
        ? '<i class="' + k + '" style="flex:' + counts[k] +
          '" title="' + TYPE[k].label + ' ' + counts[k] + '"></i>'
        : '';
    }).join('') || '<i class="zero"></i>';

    var stat = ['w','p','t','c'].map(function(k){
      return counts[k] ? counts[k] + TYPE[k].short : null;
    }).filter(Boolean).join(' / ') || '暂无';

    var statLine = total + ' 条 · ' + stat +
      (latest ? ' · 最近 ' + esc(latest.date) : '');

    return '<article class="field" data-reveal style="--d:' + ((i % 4) * 90) + 'ms">' +
      '<div class="spine"><span>' + esc(f.no) + '</span></div>' +
      '<div class="fbody">' +
        '<div class="fhead"><h3>' + esc(f.name) + '</h3>' +
          '<span class="en">' + esc(f.en) + '</span></div>' +
        '<p class="fdesc">' + esc(f.desc) + '</p>' +
        '<div class="fstat">' + statLine + '</div>' +
        '<div class="fbar">' + bar + '</div>' +
      '</div>' +
    '</article>';
  }).join('');
})();

/* ───────── 图例（构成条四种颜色的说明） ───────── */
(function buildLegend(){
  var el = $('fields-legend'); if (!el) return;
  el.innerHTML = ['w','p','t','c'].map(function(k){
    return '<span><i class="' + k + '"></i>' +
      esc(TYPE[k].label) + ' · ' + esc(TYPE[k].en) + '</span>';
  }).join('');
})();

/* ───────── 精选作品（items 里 type=p 且有链接） ───────── */
(function buildWorks(){
  var el = $('featlist'); if (!el) return;
  var list = ITEMS.filter(function(x){ return x.type === 'p' && x.u; })
    .sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
  el.innerHTML = list.map(function(it, i){
    var f = fieldOf(it.f);
    return '<a class="feat" data-reveal style="--d:' + ((i % 4) * 90) + 'ms" href="' + esc(it.u) + '">' +
      '<span class="idx">/ ' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="ftitle"><h3>' + esc(it.t) + '</h3><p>' + esc(it.s) + '</p></span>' +
      '<span class="fmeta">册 · <b>' + esc(f.name) + '</b><br>日期 · <b>' + esc(it.date) + '</b></span>' +
      '<span class="go">打开 <i>→</i></span>' +
    '</a>';
  }).join('');
})();

/* ───────── 技术栈光谱：宽度与计数按支柱词条数自动计算 ───────── */
(function fillSpectrum(){
  var rows = document.querySelectorAll('.sp-row[data-p]');
  if (!rows.length) return;
  var counts = {}, max = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.pillar[data-p]'), function(p){
    var n = p.querySelectorAll('li').length;
    counts[p.getAttribute('data-p')] = n;
    if (n > max) max = n;
  });
  Array.prototype.forEach.call(rows, function(r){
    var n = counts[r.getAttribute('data-p')] || 0;
    var bar = r.querySelector('.sp-bar i');
    if (bar) bar.style.setProperty('--w', (max ? Math.round(n / max * 100) : 0) + '%');
    var val = r.querySelector('.sp-val');
    if (val) val.innerHTML = n + '<em> 项</em>';
  });
})();

/* ───────── 支柱手风琴 ───────── */
Array.prototype.forEach.call(document.querySelectorAll('.pillar-head'), function(h){
  h.addEventListener('click', function(){
    var open = h.closest('.pillar').classList.toggle('open');
    h.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

/* ───────── 归档：双重筛选 ───────── */
var state = { f:'all', type:'all', q:'' };

$('fieldChips').innerHTML =
  '<button class="chip" type="button" data-f="all" aria-pressed="true">全部</button>' +
  FIELDS.map(function(f){
    return '<button class="chip" type="button" data-f="' + esc(f.id) +
      '" aria-pressed="false">' + esc(f.name) + '</button>';
  }).join('');

$('typeChips').innerHTML =
  '<button class="chip" type="button" data-type="all" aria-pressed="true">全部</button>' +
  Object.keys(TYPE).map(function(k){
    return '<button class="chip" type="button" data-type="' + k +
      '" aria-pressed="false">' + esc(TYPE[k].label) + '</button>';
  }).join('');

function bindChips(boxId, key){
  $(boxId).addEventListener('click', function(e){
    var b = e.target.closest('.chip'); if (!b) return;
    Array.prototype.forEach.call(this.querySelectorAll('.chip'),
      function(x){ x.setAttribute('aria-pressed','false'); });
    b.setAttribute('aria-pressed','true');
    state[key] = b.getAttribute(key === 'f' ? 'data-f' : 'data-type');
    renderArchive();
  });
}
bindChips('fieldChips','f');
bindChips('typeChips','type');
$('q').addEventListener('input', function(){ state.q = this.value; renderArchive(); });

function rowHTML(it, n){
  var ty = TYPE[it.type] || TYPE.w, f = fieldOf(it.f);
  var kk = ({w:1, p:2, t:3, c:4})[it.type] || 1;
  var inner =
    '<span class="when"><b>' + esc(it.date) + '</b>' +
      '<em>№ ' + String(n).padStart(3,'0') + '</em></span>' +
    '<span class="rmain">' +
      '<span class="kind k' + kk + '">' + esc(ty.label) + '</span>' +
      '<b>' + esc(it.t) + '</b>' +
      '<em>' + esc(it.s) + '</em>' +
    '</span>' +
    '<span class="rtags"><span class="tag">' + esc(f.name) + '</span></span>' +
    '<span class="go">' + (it.u ? '打开<i>→</i>' : '—') + '</span>';
  return '<li>' + (it.u
    ? '<a class="row" href="' + esc(it.u) + '">' + inner + '</a>'
    : '<div class="row row--plain">' + inner + '</div>') + '</li>';
}

function renderArchive(){
  var term = state.q.trim().toLowerCase();
  var list = ITEMS.filter(function(it){
    if (state.f !== 'all' && it.f !== state.f) return false;
    if (state.type !== 'all' && it.type !== state.type) return false;
    if (term && (it.t + ' ' + it.s).toLowerCase().indexOf(term) === -1) return false;
    return true;
  }).slice().sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });

  $('counter').textContent = '共 ' + ITEMS.length + ' 条 · 当前显示 ' + list.length + ' 条';

  if (!list.length){
    $('archiveBody').innerHTML = '<p class="empty">没有匹配的条目 · 换个词试试</p>';
    return;
  }

  var groups = {}, order = [];
  list.forEach(function(it){
    var y = (it.date || '').slice(0,4) || '更早';
    if (!groups[y]){ groups[y] = []; order.push(y); }
    groups[y].push(it);
  });

  var n = 0;
  $('archiveBody').innerHTML = order.map(function(y){
    var rows = groups[y].map(function(it){ return rowHTML(it, ++n); }).join('');
    return '<section class="year">' +
      '<div class="year-h"><span class="yn">' + esc(y) + '</span>' +
        '<span class="yc">' + groups[y].length + ' 条</span></div>' +
      '<ul class="index">' + rows + '</ul>' +
    '</section>';
  }).join('');
}

/* ───────── 揭幕 ───────── */
function reveal(){
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:.12, rootMargin:'0px 0px -5% 0px' });
  els.forEach(function(el){ io.observe(el); });
}

/* ───────── 滚动 ───────── */
var progress = $('progress');
var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
var sections = navLinks.map(function(a){
  return document.getElementById(a.getAttribute('href').slice(1));
}).filter(Boolean);
var ticking = false;
function onScroll(){
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(function(){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    var active = 0;
    sections.forEach(function(sec, i){
      if (sec.getBoundingClientRect().top <= 130) active = i;
    });
    navLinks.forEach(function(a, i){ a.classList.toggle('active', i === active); });
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive:true });
window.addEventListener('resize', onScroll);

/* ───────── 启动 ───────── */
fillSite();
renderArchive();
reveal();
onScroll();

})();
