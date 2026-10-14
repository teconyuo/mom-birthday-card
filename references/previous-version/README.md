# 妈妈生日贺卡（纯 HTML + CSS + JS）

一张送给妈妈的生日贺卡网页：暖色调、柔和排版、照片墙、淡入文字动画，手机和电脑都能正常打开。
**没有后端、没有框架、不联网也能显示**，双击 `index.html` 就能看。

---

## 一、怎么打开

* **电脑**：双击 `index.html`（推荐 Chrome / Edge）。
* **手机**：把整个文件夹传到手机（微信“文件传输助手”、QQ、数据线都可以），用手机浏览器打开 `index.html`；
  或者把整个文件夹上传到 GitHub Pages / 任意静态托管，把网址发给妈妈，点开就能看。
* 手机上建议用竖屏看，效果最好；页面已经做过手机适配（字体、间距、按钮、安全区域都会自动调整）。

---

## 二、怎么改成你自己的（从易到难）

### 1. 换照片（最常用）

把 `images/` 文件夹里的三张图**替换成同样的文件名**即可，不用改任何代码：

| 文件 | 显示位置 |
| --- | --- |
| `images/photo-1.jpg` | 照片墙第 1 张 |
| `images/photo-2.jpg` | 照片墙第 2 张 |
| `images/photo-3.jpg` | 照片墙第 3 张 |

* 建议用**竖版**照片（4:5），横版也能显示，会自动裁成竖版；
  想改成横版：打开 `style.css`，找到 `.polaroid img` 里的 `aspect-ratio: 4 / 5;`，改成 `3 / 2`。
* 想用 `.png` 或别的格式：打开 `index.html`，把 `src="images/photo-1.jpg"` 里的文件名改掉即可。
* 手机拍的照片一般好几 MB，建议先压缩到 500KB 以内，打开速度更快。

### 2. 改祝福语

打开 `index.html`，找到 **“② 祝福信”** 那一段（搜 `写给你的话`），里面每一行 `<p>` 就是一段话，直接改中文就行。
想加一段就复制一整行 `<p class="reveal" style="--d:600ms">…</p>`，把 `--d` 的数字依次加大（比如 750ms、900ms），文字就会一句一句慢慢浮现。

页面里其它可以改的文字：

* 封面标题：搜 `妈妈`，在“① 封面”那一段（`hero-title` / `hero-sub`）。
* 照片说明：`<figcaption>` 标签里的字。
* 心愿卡片：搜 `愿你`（“⑤ 心愿卡片”）。
* 落款署名：搜 `id="signature"`，把 `你的孩子` 改成你的名字或小名。
* 网页标签标题：`<title>` 那一行。

### 3. 换配色

打开 `style.css`，最上面的 `:root` 就是整套配色，改这几个颜色整页都会跟着变：

```css
--cream: #FFF6EC;   /* 背景奶油色 */
--peach: #FFE6CB;   /* 蜜桃色 */
--clay:  #C8674A;   /* 主色：陶土红（标题、按钮） */
--gold:  #E0A75E;   /* 点缀金 */
--ink:   #6B4A3D;   /* 正文暖棕 */
```

### 4. 觉得动画太多 / 想更简单

* 关掉飘落花瓣：删掉 `index.html` 里 `<div class="petals" …>` 整块。
* 让文字直接显示、不要淡入：把 `style.css` 里 `.reveal` 的 `opacity: 0;` 改成 `opacity: 1;`，
  并删掉 `transform: translateY(18px);`。
* 调整淡入快慢：改 `.reveal` 里的 `transition: opacity .9s …`，把 `.9s` 改大或改小。
* 不喜欢“吹蜡烛”互动：删掉 `index.html` 里 `<div class="cake-wrap">…</div>` 和 `<button id="blowBtn">` 所在的两块。

---

## 三、文件说明

```
mom-card/
├─ index.html          # 页面内容（文字都在这里改）
├─ style.css           # 样式与动画（配色、尺寸都在这里改）
├─ script.js           # 4 个小交互：淡入 / 打开贺卡 / 照片放大 / 吹蜡烛
├─ images/
│  ├─ photo-1.jpg      # ← 换成你的照片（同名覆盖）
│  ├─ photo-2.jpg
│  ├─ photo-3.jpg
│  └─ 如何替换照片.txt
├─ README.md           # 本文件
├─ CREDITS.md          # 来源与许可见说明
├─ LICENSE             # MIT 许可证
└─ references/
   └─ upstream-source/ # 二次开发所用的原始开源项目源码（仅供参考，可整段删除）
```

代码刻意写得很朴素：HTML 里全是中文注释，CSS 按 ①~⑥ 分区并标了小节，JS 只有 4 个功能、约 100 行。
想再简单一点，可以整体删掉不用的区块（HTML 和 CSS 里对应的小节都标了同样的序号）。

---

## 四、许可

本项目基于开源仓库 [sapthesh/Birthday](https://github.com/sapthesh/Birthday)（MIT License）二次开发，
原始版权声明保留在 `LICENSE` 中；具体改动内容见 `CREDITS.md`。
