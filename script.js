(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cake = document.getElementById('cake');
  var blowBtn = document.getElementById('blowBtn');
  var wishText = document.getElementById('wishText');
  var sparkLayer = document.getElementById('sparkLayer');

  /* 2-1 火花：在蜡烛火苗的位置生成一圈小火星，向外迸发后消失 */
  function burstSparks() {
    if (reduceMotion) return;
    var flame = document.querySelector('.flame');
    if (!sparkLayer || !flame) return;

    // 算出火苗相对火花图层的坐标
    var layerBox = sparkLayer.getBoundingClientRect();
    var flameBox = flame.getBoundingClientRect();
    var originX = flameBox.left - layerBox.left + flameBox.width / 2;
    var originY = flameBox.top - layerBox.top + flameBox.height / 2;

    var COUNT = 24; // 火星数量：想更热闹就调大
    for (var i = 0; i < COUNT; i++) {
      var spark = document.createElement('span');
      spark.className = 'spark';

      // 平均分布在四周，再加一点随机抖动；整体稍微向上飘
      var angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.5;
      var distance = 40 + Math.random() * 80;
      var tx = Math.cos(angle) * distance;
      var ty = Math.sin(angle) * distance - 20 - Math.random() * 35;

      spark.style.left = originX + 'px';
      spark.style.top = originY + 'px';
      spark.style.setProperty('--tx', tx.toFixed(1) + 'px');
      spark.style.setProperty('--ty', ty.toFixed(1) + 'px');
      spark.style.width = spark.style.height = (3 + Math.random() * 3).toFixed(1) + 'px';
      spark.style.animationDelay = (Math.random() * 0.08).toFixed(2) + 's';
      spark.style.animationDuration = (0.55 + Math.random() * 0.45).toFixed(2) + 's';

      // 动画播完就把这颗火星从页面里删掉，不留垃圾节点
      spark.addEventListener('animationend', function () { this.remove(); });
      sparkLayer.appendChild(spark);
    }
  }

  /* 2-2 音效：用 Web Audio 现场合成，不需要任何音频文件，离线也有声音
        （想换成自己的 mp3：见 README.md「换成自己的音效」） */
  var audioCtx = null;

  function playBlowSound() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;                        // 浏览器不支持就安静跳过
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    var t = audioCtx.currentTime;

    // ① 一声轻脆的“哒”，让点击有即时反馈
    var click = audioCtx.createOscillator();
    var clickGain = audioCtx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(1200, t);
    click.frequency.exponentialRampToValueAtTime(520, t + 0.08);
    clickGain.gain.setValueAtTime(0.0001, t);
    clickGain.gain.exponentialRampToValueAtTime(0.18, t + 0.008);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    click.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    click.start(t);
    click.stop(t + 0.18);

    // ② “呼——”的吹气声：一小段逐渐变弱的白噪声
    var noiseLength = Math.floor(audioCtx.sampleRate * 0.35);
    var noiseBuffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
    var noiseData = noiseBuffer.getChannelData(0);
    for (var i = 0; i < noiseLength; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLength);
    }
    var noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    var noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(900, t + 0.02);
    var noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, t + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.2, t + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(t + 0.02);
    noise.stop(t + 0.36);

    // ③ 最后轻轻“叮”一声，像愿望被收下
    [1046.5, 1568].forEach(function (freq, index) {
      var bell = audioCtx.createOscillator();
      var bellGain = audioCtx.createGain();
      var start = t + 0.06 + index * 0.07;
      bell.type = 'sine';
      bell.frequency.value = freq;
      bellGain.gain.setValueAtTime(0.0001, start);
      bellGain.gain.exponentialRampToValueAtTime(0.14, start + 0.01);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      bell.connect(bellGain);
      bellGain.connect(audioCtx.destination);
      bell.start(start);
      bell.stop(start + 0.55);
    });
  }

  /* 2-3 点击按钮时的总流程 */
  var blown = false;

  if (blowBtn) {
    blowBtn.addEventListener('click', function () {
      burstSparks();      // 火花迸发
      playBlowSound();    // 点击音效

      if (blown) return;  // 之后每次点击都只是再放一次火花和声音
      blown = true;

      if (cake) cake.classList.add('is-out');          // 火焰熄灭（CSS 里控制）
      if (cake) cake.setAttribute('aria-label', '蜡烛已经吹灭的生日蛋糕');
      if (wishText) {
        wishText.textContent = '愿望已经悄悄收好啦。';
        wishText.classList.add('is-visible');
      }
      blowBtn.textContent = '再送一个心愿';
    });
  }

  /* =========================================================
     3. 全屏烟花 + 平滑过渡到蛋糕许愿页面
     ========================================================= */
  var fireworks = document.getElementById('fireworks');
  var fwCanvas = document.getElementById('fireworksCanvas');
  var fwCtx = fwCanvas ? fwCanvas.getContext('2d') : null;

  // 烟花颜色：跟页面同一套暖色。想更艳一点可以换成别的配色
  var FW_COLORS = ['#FFD9A0', '#F6C6B2', '#FFB27A', '#E0A75E', '#FFEBC9', '#E88A6B'];
  var FW_SHOW_MS = 3000;   // 烟花总时长（毫秒）：想放久一点就调大
  var FW_TAIL_MS = 1600;   // 最长尾巴：最后一发炸开后最多再等这么久收场

  /* ---------- 新增 · 烟花参数（本次只动这两个数值） ----------
     下面两行是新增的，原有烟花逻辑一行未删；数值改回去就恢复原样：
     FW_SPARK_SIZE_SCALE = 1、FW_LAUNCH_PER_TICK = 1 即原版效果 */
  var FW_SPARK_SIZE_SCALE = 2;   // ① 烟花粒子尺寸放大一倍
  var FW_LAUNCH_PER_TICK = 3;    // ② 每次发射 3 发 → 烟花发射数量是原来的 3 倍

  var fw = {
    running: false,     // 是否正在播放
    raf: 0,             // requestAnimationFrame 句柄
    startedAt: 0,
    lastFrame: 0,
    nextLaunch: 0,      // 下一发烟花的发射时间
    rockets: [],        // 上升中的烟花
    sparks: []          // 炸开后的火花
  };

  /* 3-1 画布尺寸：按屏幕像素比放大，画面才清晰（上限 2 倍，省电） */
  function fwResize() {
    var rect = fwCanvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fwCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    fwCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fwCtx.lineCap = 'round';
  }

  /* 3-2 发射一发烟花：从底部往上飞，飞到目标高度就炸开 */
  function fwLaunch() {
    var w = fwCanvas.clientWidth;
    var h = fwCanvas.clientHeight;
    fw.rockets.push({
      x: w * (0.15 + Math.random() * 0.7),
      y: h + 8,
      py: h + 8,
      vy: -(h / 1.3) * (0.9 + Math.random() * 0.35),      // 每秒上升的像素
      targetY: h * (0.16 + Math.random() * 0.3),          // 在这个高度炸开
      color: FW_COLORS[(Math.random() * FW_COLORS.length) | 0]
    });
  }

  /* 3-3 炸开：以爆炸点为中心，均匀撒一圈火花 */
  function fwExplode(x, y, color) {
    var count = 44 + ((Math.random() * 24) | 0);
    // 炸开范围：粒子的初速度直接决定“炸开多大”，所以基础速度不变、整体乘 1.8
    // —— 爆炸范围放大到 1.8 倍（另外寿命延长了 20%，边缘还会再多飘一点点）
    var speed = (100 + Math.random() * 90) * 1.8;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.12;
      var velocity = speed * (0.55 + Math.random() * 0.65);
      fw.sparks.push({
        x: x, y: y,
        px: x, py: y,                                     // 上一帧的位置，用来画拖尾
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        age: 0,
        life: (0.75 + Math.random() * 0.45) * 1.2,        // 存活时间（秒）：延长 20%，散开后停留久一点
        color: color,
        size: (1.4 + Math.random() * 1.6) * FW_SPARK_SIZE_SCALE   // 新增 ①：原尺寸公式原样保留，整体乘上放大倍数
      });
    }
  }

  /* 3-4 每帧更新（dt 是按秒算的时间步长，帧率高低都快慢一致） */
  function fwFrame(now) {
    if (!fw.running) return;

    var dt = Math.min((now - fw.lastFrame) / 1000, 0.05);
    fw.lastFrame = now;
    var elapsed = now - fw.startedAt;

    // 按节奏发射新的烟花（最后一发留出爆炸和消散的时间）
    while (fw.nextLaunch < elapsed && fw.nextLaunch < FW_SHOW_MS - 1100) {
      fwLaunch();
      // 新增 ②：同一次发射多发，烟花发射数量提升到原来的 3 倍（发射节奏保持原样）
      for (var extra = 1; extra < FW_LAUNCH_PER_TICK; extra++) fwLaunch();
      fw.nextLaunch += 480 + Math.random() * 460;
    }

    // 上升中的烟花
    for (var i = fw.rockets.length - 1; i >= 0; i--) {
      var rocket = fw.rockets[i];
      rocket.px = rocket.x;
      rocket.py = rocket.y;
      rocket.y += rocket.vy * dt;
      if (rocket.y <= rocket.targetY) {
        fwExplode(rocket.x, rocket.y, rocket.color);
        fw.rockets.splice(i, 1);
      }
    }

    // 炸开后的火花：受重力下坠，逐渐变暗
    for (var j = fw.sparks.length - 1; j >= 0; j--) {
      var s = fw.sparks[j];
      s.age += dt;
      if (s.age >= s.life) {
        fw.sparks.splice(j, 1);
        continue;
      }
      s.px = s.x;
      s.py = s.y;
      s.vy += 150 * dt;      // 重力
      s.vx *= 0.985;         // 空气阻力
      s.vy *= 0.985;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }

    fwDraw();

    // 演完了：时间到且没有残留，或者超过最长尾巴，就收场
    if (elapsed > FW_SHOW_MS + FW_TAIL_MS ||
        (elapsed > FW_SHOW_MS && !fw.rockets.length && !fw.sparks.length)) {
      fwFinish();
      return;
    }

    fw.raf = window.requestAnimationFrame(fwFrame);
  }

  /* 3-5 画面：清空后把火箭和火花画成一条条短线，自然带出拖尾 */
  function fwDraw() {
    var w = fwCanvas.clientWidth;
    var h = fwCanvas.clientHeight;

    fwCtx.clearRect(0, 0, w, h);
    fwCtx.globalCompositeOperation = 'lighter';   // 叠加发光

    fw.rockets.forEach(function (rocket) {
      fwCtx.strokeStyle = rocket.color;
      fwCtx.lineWidth = 2.4;
      fwCtx.beginPath();
      fwCtx.moveTo(rocket.px, rocket.py);
      fwCtx.lineTo(rocket.x, rocket.y);
      fwCtx.stroke();
    });

    fw.sparks.forEach(function (s) {
      fwCtx.globalAlpha = Math.max(1 - s.age / s.life, 0);
      fwCtx.strokeStyle = s.color;
      fwCtx.lineWidth = s.size;
      fwCtx.beginPath();
      fwCtx.moveTo(s.px, s.py);
      fwCtx.lineTo(s.x, s.y);
      fwCtx.stroke();
    });

    fwCtx.globalAlpha = 1;
    fwCtx.globalCompositeOperation = 'source-over';
  }

  /* 3-6 开始播放烟花 */
  function startFireworks() {
    if (!fireworks || !fwCtx) {
      revealCakePage();
      return;
    }
    if (fw.running) return;   // 正在放就别重复触发

    fw.running = true;
    fw.rockets = [];
    fw.sparks = [];
    fw.nextLaunch = 140;

    fireworks.hidden = false;
    setCardLocked(true);
    if (skipFireworks) skipFireworks.focus();
    fwResize();

    fw.startedAt = performance.now();
    fw.lastFrame = fw.startedAt;

    // 下一帧再加 is-on，这样背景有一次淡入
    window.requestAnimationFrame(function () { fireworks.classList.add('is-on'); });
    fw.raf = window.requestAnimationFrame(fwFrame);
  }

  /* 3-7 收场：淡出烟花 → 解锁滚动 → 平滑滑到蛋糕许愿页面 */
  function fwFinish() {
    if (!fw.running) return;                          // 已经收过场（例如被手动跳过）

    fw.running = false;
    if (fw.raf) window.cancelAnimationFrame(fw.raf);
    fw.raf = 0;
    fw.rockets = [];
    fw.sparks = [];
    fwDraw();                                         // 把画布擦干净

    fireworks.classList.remove('is-on');              // 背景开始淡出（CSS 过渡 0.45s）

    window.setTimeout(function () {
      fireworks.hidden = true;
      document.body.style.overflow = '';              // 先解锁滚动
      revealCakePage();                               // 再平滑过渡到蛋糕页面
    }, 430);
  }

  /* 3-8 平滑过渡到蛋糕许愿页面：让这一屏的文字先进入渐显状态，再滚过去 */
  function revealCakePage() {
    var target = document.getElementById('cake-section');
    if (!target) return;
    setCardLocked(false);
    if (openBtn) {
      openBtn.disabled = false;
      openBtn.classList.remove('is-hidden');
    }
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
  }

  /* 3-9 绑定「打开贺卡」按钮等 */
  var openBtn = document.getElementById('openBtn');

  var countdown = document.getElementById('countdown');
  var countdownNum = document.getElementById('countdownNum');
  var skipFireworks = document.getElementById('skipFireworks');
  var counting = false;
  var countdownTimer = 0;

  function setCardLocked(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
    document.querySelectorAll('body > header, body > main, body > footer').forEach(function (region) {
      region.inert = locked;
    });
  }

  function startCountdown() {
    if (counting || fw.running) return;
    if (!countdown || !countdownNum) {
      startFireworks();
      return;
    }
    counting = true;
    openBtn.disabled = true;
    openBtn.classList.add('is-hidden');
    setCardLocked(true);
    countdown.hidden = false;
    var remaining = 3;

    function showStep() {
      if (remaining === 0) {
        countdown.hidden = true;
        counting = false;
        startFireworks();
        return;
      }
      countdownNum.textContent = String(remaining);
      countdownNum.classList.remove('is-pop');
      void countdownNum.offsetWidth;
      countdownNum.classList.add('is-pop');
      remaining -= 1;
      countdownTimer = window.setTimeout(showStep, 1000);
    }
    showStep();
  }
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      // 关了动态效果、或者浏览器不支持画布：直接平滑滑到蛋糕页面
      if (reduceMotion || !fireworks || !fwCtx) {
        revealCakePage();
        return;
      }
      startCountdown();
    });
  }

  // 烟花播放中轻触屏幕可以跳过
  if (fireworks) {
    fireworks.addEventListener('click', function () {
      // 刚点完按钮的那一下“连点”不算跳过，避免烟花一闪而过
      if (performance.now() - fw.startedAt < 250) return;
      fwFinish();
    });
  }

  // 手机上横竖屏切换时重新调整画布尺寸
  window.addEventListener('resize', function () {
    if (fw.running) fwResize();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && counting) {
      window.clearTimeout(countdownTimer);
      counting = false;
      countdown.hidden = true;
      revealCakePage();
    } else if (event.key === 'Escape' && fw.running) {
      fwFinish();
    } else if (event.key === 'Tab' && fw.running) {
      event.preventDefault();
      if (skipFireworks) skipFireworks.focus();
    }
  });

  FW_COLORS.push('#FF5C7A', '#FFD166', '#5CE1E6', '#7AE582', '#B48CFF', '#FF8FD0');
})();
