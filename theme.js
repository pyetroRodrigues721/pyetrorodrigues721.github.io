/* ============================================================
   夜读主题 · 全站唯一实现
   ------------------------------------------------------------
   共享 localStorage['zp-ink']（paper|night），兼容 code.html
   旧键 theme（dark|light）。每个页面的按钮自定义：
     id     ：inkBtn / pageInkBtn / themeBtn（自动识别第一个）
     data-labels="白天显示|夜晚显示"   默认 "夜读|纸张"
     data-dark-attr：额外维护 body[data-theme=dark]（code.html 用）
   ============================================================ */
(function () {
  var doc = document.documentElement;
  var btn = document.getElementById('inkBtn') ||
            document.getElementById('pageInkBtn') ||
            document.getElementById('themeBtn');
  if (!btn) return;
  var labels = (btn.getAttribute('data-labels') || '夜读|纸张').split('|');
  var darkAttr = btn.hasAttribute('data-dark-attr');
  var tc = document.getElementById('themeColor');

  function apply(v) {
    var night = v === 'night';
    doc.setAttribute('data-ink', v);
    if (darkAttr) {
      if (night) document.body.setAttribute('data-theme', 'dark');
      else document.body.removeAttribute('data-theme');
    }
    btn.setAttribute('aria-pressed', night ? 'true' : 'false');
    btn.textContent = night ? labels[1] : labels[0];
    if (tc) tc.setAttribute('content', night ? '#15140f' : '#f0ede6');
    try { localStorage.setItem('zp-ink', v); } catch (e) {}
    try { localStorage.setItem('theme', night ? 'dark' : 'light'); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem('zp-ink'); } catch (e) {}
  if (!saved) {
    try { if (localStorage.getItem('theme') === 'dark') saved = 'night'; } catch (e) {}
  }
  apply(saved === 'night' ? 'night' : 'paper');

  btn.addEventListener('click', function () {
    apply(doc.getAttribute('data-ink') === 'night' ? 'paper' : 'night');
  });
})();
