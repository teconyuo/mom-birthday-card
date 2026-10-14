# 来源与二次开发说明

## 上游项目（原始源码）

* 仓库：[sapthesh/Birthday](https://github.com/sapthesh/Birthday)
* 说明：*Customizable Birthday Web Template* —— 一个纯前端的生日祝福网页模板（HTML / CSS / Less / JavaScript + jQuery）
* 许可：MIT License（Copyright © 2025 Sapthesh V），全文见 `LICENSE`
* 获取方式：`git clone https://github.com/sapthesh/Birthday.git`（本次拉取的提交：`04cc9c5`）
* 原始源码保留在 `references/upstream-source/`，未做任何修改；如果不需要可以参考后删除。

### 选择它的原因

1. MIT 开源协议，允许修改、商用、再发布，只要求保留版权声明；
2. 纯静态：HTML + CSS + JS，没有后端、没有数据库、没有构建步骤；
3. 本身就带暖色（Peach `#FFDAB9`）底子、有「逐步开启贺卡」的仪式感流程、有照片/横幅展示位，
   与「温馨柔和、暖色调、预留图片位置、简单文字动画」的需求方向一致；
4. 体量小、结构直白，适合作为二次开发的基础。

（同时比较过的其它候选：`abandon888/HappyBirthday`、`engrshuvodas/Birthday-Wish-Card`、
`Harmann60/Happy-Birthday`、`sapthesh/Birthday-V3` 等，详见最后「取舍说明」。）

## 本次二次开发做了什么

上游那套代码是 2013 年前后的写法：依赖 Bootstrap / jQuery / Less.js / Google Fonts 四个 CDN，
样式用 Less 变量和七套 `@keyframes` 手写浏览器前缀，在手机上打开依赖网络、也不方便微调。
因此按你的需求重做了一版，保留它的「暖色调 + 分步开启 + 祝福文字渐显 + 蛋糕元素」思路，代码整体重写：

| 你的需求 | 具体改动 |
| --- | --- |
| 修改祝福语，写适合妈妈的文案 | 全部文案改为中文，围绕妈妈重写封面、祝福信、心愿卡片、落款（原项目是通用英文长文案） |
| 预留图片位，方便替换照片 | 新增 `images/` 目录与 3 个拍立得相框位（`photo-1.jpg`~`photo-3.jpg`），替换同名文件即可，无需改代码；点照片可放大查看 |
| 手机端适配 | 改为移动优先写法：`clamp()` 流式字号、`100svh` 避免地址栏遮挡、刘海屏 `env(safe-area-inset-*)`、按钮 ≥48px 便于点按、照片墙窄屏单列宽屏三列、禁横向滚动 |
| 代码尽量简单 | 去掉 Bootstrap / jQuery / Less / 外部字体等全部依赖，只剩 `index.html` + `style.css` + `script.js`，约 20KB，含中文注释与 ①-⑥ 分区；JS 仅 4 个功能约 100 行 |
| 风格温馨柔和 | 换成奶油白/蜜桃/陶土红/暖棕的暖色系；动画只保留淡入上移、烛光摇曳、爱心轻跳和缓慢飘落的花瓣，并支持系统「减少动态效果」 |
| 其它 | 新增纯 CSS 小蛋糕与「吹灭蜡烛」互动、照片灯箱、`prefers-reduced-motion` 适配、完整中文 README |

## 上游 MIT 许可的保留

MIT 许可要求：再发布时保留版权声明与许可全文。`LICENSE` 中**完整保留**了上游
`Copyright (c) 2025 Sapthesh V` 的原文，并另起一段说明本衍生版本的改动，符合许可要求。

## 取舍说明（为什么没用别的仓库）

* `abandon888/HappyBirthday`（MIT，319★）：依赖 GSAP + rspack 打包构建，改一次要装 Node 环境，不符合「代码尽量简单」。
* `engrshuvodas/Birthday-Wish-Card`（79★，暖心贺卡）：设计很接近，但仓库 LICENSE 实为 Apache-2.0（README 写 MIT，二者不一致），
  且依赖 GSAP CDN 与外站 iframe，故未采用。
* `Harmann60/Happy-Birthday`（MIT，130★）：有照片位，但依赖 Tailwind / AOS / lightGallery 三个 CDN，
  整体是浅蓝色动漫风长页面，暖色调需要大改，量级偏大。
* `DenverCoder1/Responsive-Birthday-Card`（MIT，26★）：只有一张卡片的骨架，够简单但没有照片位与文字动画，可改的基础太少。
* `sapthesh/Birthday-V3`（28★）：交互更花哨（沉浸式多场景），与「不要炫酷花哨特效」相冲突。
