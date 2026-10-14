/* =========================================================
   妈妈生日贺卡 · 交互脚本
   只用原生 JavaScript，没有任何依赖，一共 4 个小功能：
   1. 文字滚动到屏幕里时淡入
   2. 「打开贺卡」按钮跳转到祝福区
   3. 点照片可以放大查看
   4. 「吹灭蜡烛」的小互动
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 1. 渐显文字：滚动到可见区域时添加 is-visible ---------- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 出现过一次就不再监听
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    // 很老的浏览器直接全部显示
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 2. 「打开贺卡」：平滑滚动到祝福信 ---------- */
  var openBtn = document.getElementById('openBtn');
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      var letter = document.getElementById('letter');
      if (letter) letter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- 3. 点照片放大查看 ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden'; // 放大时禁止背景滚动
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.polaroid img').forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img.src, img.alt);
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      // 点空白处或关闭按钮都退出
      if (e.target !== lightboxImg) closeLightbox();
    });
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- 4. 吹灭蜡烛的小互动 ---------- */
  var cake = document.getElementById('cake');
  var blowBtn = document.getElementById('blowBtn');
  var wishText = document.getElementById('wishText');

  if (blowBtn) {
    blowBtn.addEventListener('click', function () {
      if (cake) cake.classList.add('is-out');       // 火焰熄灭（CSS 里控制）
      if (wishText) wishText.classList.add('is-visible');
      blowBtn.textContent = '生日愿望：一定实现 ✨';
      blowBtn.disabled = true;
      blowBtn.style.opacity = '.75';
      blowBtn.style.cursor = 'default';
    });
  }
})();
