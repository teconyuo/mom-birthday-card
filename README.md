# 给妈妈的生日贺卡

一张可以离线打开的生日贺卡。杏米色信纸、手绘花束信封和楷体祝福，配有倒计时、生日烟花和吹蜡烛互动。使用原生 HTML、CSS、JavaScript，没有框架、CDN 或构建步骤。

## 打开方式

- 电脑：双击 `index.html`，推荐使用 Chrome 或 Edge。
- 手机：将整个目录部署到静态网站托管服务，再用手机浏览器打开网址。也可用支持本地 HTML 的浏览器打开整套文件。
- 分享或移动文件时，保留 `assets/` 和三个页面文件的相对位置。
- 页面在 760px 及以下改为上下排版，并适配手机安全区域。

## 页面内容

| 区块 | 内容 |
| --- | --- |
| 封面 | 生日祝福、花束信封、「打开贺卡」按钮 |
| 许愿 | 小蛋糕、吹灭蜡烛、愿望反馈 |
| 祝福 | 四句写给妈妈的心愿 |
| 落款 | 祝福语和署名 |

「打开贺卡」依次播放 3、2、1 倒计时和五彩烟花，结束后滚动至蛋糕。点击烟花画面或「跳过烟花，去许愿」可以提前结束；Esc 也能跳过倒计时或烟花。播放期间锁定背景交互，结束后将键盘焦点移至许愿区。

吹蜡烛会播放火花和合成音效，熄灭烛火并显示愿望反馈。之后点击「再送一个心愿」可再次播放火花和声音。

开启系统「减少动态效果」时，直接进入许愿区，不播放倒计时、烟花和火花。禁用 JavaScript 时，页面文字和插画仍然可读，互动需要 JavaScript。

## 修改内容

在 `index.html` 中搜索：

- `hero-title`、`hero-sub`：封面祝福。
- `wish-list`：四句心愿。
- `sign-message`：结尾祝福。
- `id="signature"`：把「你的孩子」改成自己的名字。
- `<title>`：浏览器标签标题。

花束插画在 `assets/birthday-bouquet.svg`，使用本地矢量绘制，可直接编辑颜色和形状。字体优先使用设备自带的楷体，缺少时按字体列表回退，不需要联网下载。

## 修改配色

`style.css` 顶部的 `:root` 定义主要配色：

| 变量 | 色值 | 用途 |
| --- | --- | --- |
| `--paper` | `#FFFCF6` | 内容区纸白 |
| `--cream` | `#F8E9D5` | 封面与落款底色 |
| `--berry` | `#9B4436` | 标题、按钮 |
| `--pink` | `#E5A08A` | 花朵点缀 |
| `--leaf` | `#6D754C` | 花叶 |
| `--ink` | `#503E32` | 正文 |

SVG 插画有自己的填充色，需要在 SVG 中同步修改对应色值。

## 修改互动

`script.js` 中：

- `FW_SHOW_MS`：烟花发射时长，默认 3000 毫秒，之后等待尾部火花消散。
- `FW_COLORS`：烟花颜色，文件末尾也追加了五彩配色。
- `FW_SPARK_SIZE_SCALE`：烟花颗粒尺寸倍率。
- `FW_LAUNCH_PER_TICK`：每轮发射数量。
- `startCountdown()`：倒计时逻辑，每个数字停留 1000 毫秒。
- `burstSparks()`：吹蜡烛的火花。
- `playBlowSound()`：Web Audio 合成音效，无需音频文件。删除调用即可静音。

## 文件

```text
index.html                    页面内容
style.css                     样式、排版与动画
script.js                     倒计时、烟花和吹蜡烛
assets/birthday-bouquet.svg    封面花束信封插画
images/                       旧版占位图，当前未使用
references/previous-version/  含祝福信和照片墙的旧版
references/upstream-source/   上游源码
CREDITS.md                    项目来源与更新记录
LICENSE                       MIT 许可
```

## 许可

基于 [sapthesh/Birthday](https://github.com/sapthesh/Birthday)（MIT License）二次开发。上游版权声明保留在 `LICENSE`，来源说明见 `CREDITS.md`。
