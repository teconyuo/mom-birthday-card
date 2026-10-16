/* =========================================================
   妈妈生日贺卡 · 交互脚本
   只用原生 JavaScript，没有任何依赖，一共 3 个功能：
   1. 文字滚动到屏幕里时淡入
   2. 点「轻轻吹灭蜡烛」：火花迸发 + 点击音效 + 蜡烛熄灭
   3. 点「打开贺卡」：先放全屏烟花，放完平滑滑到蛋糕许愿页面
   ========================================================= */

(function () {
  'use strict';

  // 系统是否开启了「减少动态效果」：开了就跳过烟花、火花这类动画
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. 渐显文字：滚动到可见区域时添加 is-visible
     ========================================================= */
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

  /* =========================================================
     2. 吹蜡烛：火花 + 音效
     ========================================================= */
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
      if (wishText) wishText.classList.add('is-visible');
      blowBtn.textContent = '再吹一次 ✨';
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
    if (!fireworks || !fwCtx || fw.running) return;   // 正在放就别重复触发

    fw.running = true;
    fw.rockets = [];
    fw.sparks = [];
    fw.nextLaunch = 140;

    fireworks.hidden = false;
    document.body.style.overflow = 'hidden';          // 播放时先别让页面滚动
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
    target.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* 3-9 绑定「打开贺卡」按钮等 */
  var openBtn = document.getElementById('openBtn');

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      // 关了动态效果、或者浏览器不支持画布：直接平滑滑到蛋糕页面
      if (reduceMotion || !fireworks || !fwCtx) {
        revealCakePage();
        return;
      }
      startFireworks();
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

  /* =========================================================
     新增（倒计时模块用）：把烟花接口导出，倒计时结束后直接调用
     —— 上面原有代码一行都没有改动，这里只是新增一个对外出口
     ========================================================= */
  // 给烟花配色补上几支高饱和色，让烟花变成「五彩」；原有暖色配色原样保留
  FW_COLORS.push('#FF5C7A', '#FFD166', '#5CE1E6', '#7AE582', '#B48CFF', '#FF8FD0');

  window.__birthdayCard = {
    startFireworks: startFireworks,   // 开始播放全屏烟花（播完会自动滑到蛋糕页）
    finishFireworks: fwFinish         // 提前收场（备用）
  };
})();


/* =========================================================
   新增 · 倒计时模块：3 → 2 → 1，结束立刻放五彩烟花
   点「打开贺卡」后的顺序：按钮隐藏 → 倒计时 → 烟花 → 滑到蛋糕页
   （本段全部是新增代码，没有删除也没有改动上面任何原有逻辑）
   ========================================================= */
(function () {
  'use strict';

  var openBtn = document.getElementById('openBtn');
  var countdown = document.getElementById('countdown');
  var countdownNum = document.getElementById('countdownNum');
  var card = window.__birthdayCard;

  // 少了任何一块都别乱来，直接交回原来的按钮逻辑
  if (!openBtn || !countdown || !countdownNum || !card) return;

  // 系统开了「减少动态效果」时不做倒计时，交回原本的按钮逻辑（原本会直接滑到蛋糕页）
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var STEP_MS = 1000;     // 每个数字停留 1 秒
  var STEPS = ['3', '2', '1'];
  var counting = false;   // 正在倒计时，防重复触发

  /* 逐个显示数字：每次换数字都重放一次「缩放 + 淡入淡出」动画 */
  function startCountdown() {
    counting = true;

    openBtn.classList.add('is-hidden');   // ① 按钮隐藏

    countdown.hidden = false;             // ② 显示倒计时图层（背景还是原来的页面背景）
    countdownNum.textContent = '';

    var index = 0;

    function showStep() {
      if (index >= STEPS.length) {
        finishCountdown();
        return;
      }

      countdownNum.textContent = STEPS[index];
      index += 1;

      // 去掉再重排，保证同一个动画在下一个数字上重新播放
      countdownNum.classList.remove('is-pop');
      void countdownNum.offsetWidth;
      countdownNum.classList.add('is-pop');

      window.setTimeout(showStep, STEP_MS);
    }

    function finishCountdown() {
      countdownNum.classList.remove('is-pop');
      countdownNum.textContent = '';
      countdown.hidden = true;            // 收起倒计时
      counting = false;

      card.startFireworks();              // ③ 数字结束，立刻放五彩烟花
    }

    showStep();
  }

  /* 在「捕获阶段」拦下这一下点击：
     先隐藏按钮、改播倒计时，倒计时结束后我们自己调烟花。
     原有按钮上的监听没有被删掉，只是这一下不让它先跑。 */
  document.addEventListener('click', function (event) {
    if (event.target !== openBtn) return;

    event.stopPropagation();              // 挡住原有监听，避免烟花抢在倒计时前面
    if (counting) return;                 // 倒计时中重复点，忽略

    startCountdown();
  }, true);
})();
