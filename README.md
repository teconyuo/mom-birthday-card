# 妈妈生日贺卡（纯 HTML + CSS + JS）

一张送给妈妈的生日贺卡网页：暖色调、柔和小蛋糕、吹蜡烛的火花与音效、淡入文字动画，
手机和电脑都能正常打开。**没有后端、没有框架、不联网也能显示**，双击 `index.html` 就能看。

---

## 一、怎么打开

* **电脑**：双击 `index.html`（推荐 Chrome / Edge）。
* **手机**：把整个文件夹传到手机（微信“文件传输助手”、QQ、数据线都可以），用手机浏览器打开 `index.html`；
  或者把整个文件夹上传到 GitHub Pages / 任意静态托管，把网址发给妈妈，点开就能看。
* 手机上建议竖屏看，效果最好；页面已做手机适配（字号、间距、按钮、刘海屏安全区域都会自动调整）。

---

## 二、页面结构（共 4 屏，HTML 与 CSS 里的编号一一对应）

| 编号 | 区块 | 内容 |
| --- | --- | --- |
| ① | 封面 | 「妈妈，生日快乐」标题 + 「打开贺卡 ❤」按钮（点击后先播**全屏烟花**，烟花放完再平滑滑到 ②） |
| ② | 许个愿吧 | 纯 CSS 小蛋糕 + 「轻轻吹灭蜡烛」按钮（点击后：**火花迸发 + 点击音效**，烛火熄灭，愿望文字浮现） |
| ③ | 愿你 | 4 张心愿小卡片 |
| ④ | 落款 | 署名 + 跳动的小爱心 |

> 原来（上一版）的「写给你的话」祝福信和「我们的时光」照片墙，已按要求整体删除。
> 如果以后想恢复，上一版的完整文件放在 `references/previous-version/`，复制回来即可。

---

## 三、怎么改成你自己的

### 1. 改文案

打开 `index.html`，按 ①②③④ 的注释找到对应区块，直接改中文：

* 封面标题 / 副标题：搜 `hero-title`、`hero-sub`。
* 心愿卡片：搜 `愿你`（③ 区块），一共 4 句，想加就复制一整行。
* 落款署名：搜 `id="signature"`，把 `你的孩子` 改成你的名字或小名。
* 网页标签标题：`<title>` 那一行。

### 2. 调整吹蜡烛的火花

* 火星数量：`script.js` 里 `var COUNT = 24;`，数字调大更热闹。
* 飞散距离：同一函数里的 `var distance = 40 + Math.random() * 80;`（40 是最近，120 是最远，单位 px）。
* 火花颜色 / 大小：`style.css` 里 `.spark` 的 `background` 与 `box-shadow`（大小由 JS 随机给到 3~6px）。
* 火花时长：`script.js` 里 `spark.style.animationDuration = (0.55 + Math.random() * 0.45)`。

### 3. 调整「打开贺卡」时的全屏烟花

点「打开贺卡 ❤」会先在整屏放一段烟花（暖金色系，约 4 秒），放完自动淡出并平滑滑到蛋糕页面。
播放中轻触屏幕可以跳过。

* 烟花时长：`script.js` 里 `var FW_SHOW_MS = 3000;`（毫秒；改大放更久，改小更利落）。
* 烟花颜色：同文件里 `FW_COLORS` 数组，现在是金/蜜桃/陶土几个暖色，换成别的就是另一套风格。
* 烟花密度：`fwLaunch()` 里的 `fw.nextLaunch += 480 + Math.random() * 460;`（数字调小 = 更密集）。
* 烟花颗粒数：`fwExplode()` 里的 `var count = 44 + ...`。
* 炸开大小：`fwExplode()` 里的 `var speed = (100 + Math.random() * 90) * 1.8;`
  —— 粒子的初速度直接决定爆炸半径，这个倍率现在就是 1.8 倍，想更夸张就把它调大。
* 散开后停留多久：同一行附近的 `life: (0.75 + Math.random() * 0.45) * 1.2,`
  —— `1.2` 表示粒子寿命延长 20%，数字越大火星停留越久（改大后收场也会稍晚一点）。
* 背景压暗程度：`style.css` 里 `.fireworks` 的 `background`，把两个 `rgba(...)` 的透明度调低就更透，
  或者整行删掉——那样烟花会直接叠在页面浅色背景上。
* 完全不要烟花：把 `index.html` 里 `<div id="fireworks" …>` 整块删掉（脚本会自动降级为直接滑到蛋糕页）。

### 4. 换成自己的音效（可选）

默认音效是**用 Web Audio 现场合成的**（一声轻脆点击 + 吹气声 + 轻“叮”），
所以不需要任何音频文件、离线也有声音。如果你有喜欢的 mp3，替换方法：

1. 在项目里新建 `sound/` 文件夹，把音频放进去，例如 `sound/blow.mp3`。
2. 在 `index.html` 的 `</body>` 之前加一行：

   ```html
   <audio id="blowAudio" src="sound/blow.mp3" preload="auto"></audio>
   ```

3. 把 `script.js` 里的 `playBlowSound()` 函数**整个换成**下面这三行：

   ```js
   function playBlowSound() {
     var audio = document.getElementById('blowAudio');
     if (!audio) return;
     audio.currentTime = 0;   // 归零，支持连点
     audio.play();
   }
   ```

   （音效由点击触发，手机上不会被“自动播放”策略拦住。）

### 5. 换配色

打开 `style.css`，最上面的 `:root` 就是整套配色，改这几个颜色整页都会跟着变：

```css
--cream: #FFF6EC;   /* 背景奶油色 */
--peach: #FFE6CB;   /* 蜜桃色 */
--clay:  #C8674A;   /* 主色：陶土红（标题、按钮） */
--gold:  #E0A75E;   /* 点缀金 */
--ink:   #6B4A3D;   /* 正文暖棕 */
```

### 6. 觉得动画太多 / 想更简单

* 关掉飘落花瓣：删掉 `index.html` 里 `<div class="petals" …>` 整块。
* 让文字直接显示、不要淡入：把 `style.css` 里 `.reveal` 的 `opacity: 0;` 改成 `opacity: 1;`，
  并删掉 `transform: translateY(18px);`。
* 调整淡入快慢：改 `.reveal` 里的 `transition: opacity .9s …`。
* 不要火花：删掉 `script.js` 里 `burstSparks()` 的调用，或把 `COUNT` 改成 0。
* 不要烟花：见上面第 3 条最后一行。
* 不要音效：删掉 `playBlowSound()` 的调用。
* 删掉整块：每屏都是独立的 `<section>`，HTML 和 CSS 里都标了同样的 ①~④ 编号，删一处另一处跟着删就行。

---

## 四、文件说明

```
birthday-mom/
├─ index.html          # 页面内容（文案都在这里改，注释标了 ①~④）
├─ style.css           # 样式与动画（配色、尺寸、火花外观都在这）
├─ script.js           # 3 个交互：文字淡入 / 吹蜡烛（火花 + 音效）/ 打开贺卡（全屏烟花 + 过渡）
├─ images/             # 上一版照片墙用的占位图，现在没被页面使用，可以整个删掉
├─ README.md           # 本文件
├─ CREDITS.md          # 来源、二次开发记录与许可见说明
├─ LICENSE             # MIT 许可证（保留上游版权声明）
└─ references/
   ├─ upstream-source/    # 二次开发所用的原始开源项目源码（仅供参考，可删）
   └─ previous-version/   # 上一版（含祝福信 + 照片墙），想恢复就从这里复制
```

代码刻意写得很朴素：HTML 里全是中文注释，CSS 按 ①~④ 分区加一个烟花图层，JS 只有 3 个功能、约 280 行。

---

## 五、许可

本项目基于开源仓库 [sapthesh/Birthday](https://github.com/sapthesh/Birthday)（MIT License）二次开发，
原始版权声明保留在 `LICENSE` 中；具体改动内容见 `CREDITS.md`。
