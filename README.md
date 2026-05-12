# xalgo · Apple Horizon Theme

为 xalgo 品牌定制的 Shopify 主题，基于 Shopify 官方 [Horizon](https://themes.shopify.com/themes/horizon) 主题（v3.5.1）二次开发，采用「奶油苹果（Cream Apple）」设计语言，呈现精致、柔和、带有 Apple 风格细节的女性智能硬件购物体验。

---

## 品牌与产品线

xalgo 是一个面向女性的智能硬件品牌，首页通过三条独立的 Hero 线 + 一段「Her Day」叙事串联三款产品：

| 产品 | 标语 | 定位 |
| --- | --- | --- |
| **xRing** | *Sleep. Stress. Cycle. All watched.* | 1.9g 智能戒指，睡眠 / 压力 / 周期监测 |
| **xGlass** | *It speaks before you ask.* | AI 语音智能眼镜 |
| **xFrame** | *Your memory, as a masterpiece.* | 将照片转化为油画的数字艺术相框 |

品牌理念：*Technology should feel like jewelry, not homework.*

---

## 设计系统：Cream Apple

核心令牌定义在 [assets/xalgo-custom.css](assets/xalgo-custom.css)：

```css
--xalgo-cream:      #FDFAF7   /* 奶油底色 */
--xalgo-rose:       #E8A598   /* 主色，玫瑰粉 */
--xalgo-rose-dark:  #D4918A
--xalgo-rose-light: #F2DDD8
--xalgo-champagne:  #C9A882   /* 香槟金 */
--xalgo-warm-gray:  #F5F0EB
--xalgo-dark:       #1A1F2E
```

设计细节：
- 顶栏毛玻璃（`backdrop-filter: saturate(180%) blur(20px)`）
- Hero 排版使用 Apple 风格 `letter-spacing: -0.03em` + `line-height: 1.05`
- 按钮悬浮微动效 `translateY(-1px)` + 玫瑰色阴影
- 价格数字等宽（`font-variant-numeric: tabular-nums`）
- 平滑滚动与卡片悬浮微交互

---

## 项目结构

标准 Shopify OS 2.0 主题结构：

```
apple-horizon-theme/
├── assets/              # CSS / JS / SVG 图标 / 字体（114 个文件）
│   └── xalgo-custom.css # xalgo 品牌层样式（Cream Apple 设计系统）
├── blocks/              # 可复用的 Liquid 块（90+ 个）
│   └── _header-logo.liquid
├── config/
│   ├── settings_schema.json   # 主题编辑器可配置项
│   └── settings_data.json     # 当前主题配置
├── layout/
│   ├── theme.liquid     # 全局布局
│   └── password.liquid  # 密码页布局
├── locales/             # 52 个语言文件（含 zh-CN / zh-TW / ja / ko …）
├── sections/            # 页面区块
│   ├── hero.liquid
│   ├── xalgo-her-day.liquid   # 自定义：四标签生活叙事
│   ├── header-group.json
│   ├── footer-group.json
│   └── …
├── snippets/            # 103 个可复用片段
└── templates/           # 页面模板（index / product / collection / cart / blog …）
```

---

## 自定义 Section：`xalgo-her-day`

位置：[sections/xalgo-her-day.liquid](sections/xalgo-her-day.liquid)

灵感来源：Oura Ring 的 tabbed showcase。用 4 个标签串起用户一天的场景，讲述三款产品在不同时刻如何接力陪伴：

- **Morning** — Ring's Moment（睡眠数据）
- **Going Out** — Glasses' Moment（智能提醒）
- **Evening** — Frame's Moment（记忆画作）
- **Night** — Ring Takes Over（入睡监测）

每个 Tab 包含：场景图 + 两张数据小图 + 文案描述 + 用户语录，在主题编辑器中可完全配置。

---

## 首页结构（templates/index.json）

```
hero_ring      → xRing Hero
hero_glasses   → xGlass Hero
hero_frame     → xFrame Hero
her_day_tabs   → Her Day with xalgo（自定义区块）
brand_story    → 品牌哲学
testimonials   → 真实用户评价
newsletter     → 邮件订阅
```

---

## 开发 & 部署

本项目为 Shopify 主题源代码，需使用 [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) 进行本地开发与部署。

### 安装依赖
```bash
# 安装 Shopify CLI
npm install -g @shopify/cli @shopify/theme
```

### 本地开发
```bash
# 在项目根目录
shopify theme dev --store=your-store.myshopify.com
```
启动后会提供一个预览 URL，编辑器内任何改动都会实时热重载。

### 推送到 Shopify Store
```bash
# 推送为一个未发布的主题（推荐先这样做）
shopify theme push --unpublished

# 或覆盖指定主题
shopify theme push --theme=<THEME_ID>
```

### 拉取线上配置
```bash
shopify theme pull --theme=<THEME_ID>
```
注意：`config/settings_data.json` 和 `templates/*.json` 会被主题编辑器改写，拉取前先 commit。

---

## 二次开发约定

- **品牌样式统一写入** [assets/xalgo-custom.css](assets/xalgo-custom.css)，避免散落到各 section 内联样式
- 该文件在 [layout/theme.liquid:35](layout/theme.liquid#L35) 中通过 `{{ 'xalgo-custom.css' | asset_url | stylesheet_tag }}` 全局引入，确保覆盖 Horizon 默认样式
- 新建 xalgo 专属 section 以 `xalgo-` 前缀命名（如 `xalgo-her-day.liquid`），方便与 Horizon 原生 section 区分
- 仅对确实需要改造的 Horizon 文件做修改，减少未来同步上游升级的成本

---

## 基础信息

- **基座主题**：Shopify Horizon v3.5.1
- **平台**：Shopify Online Store 2.0
- **多语言**：52 种语言（包含简中 / 繁中 / 日 / 韩）
- **主分支**：`main`
