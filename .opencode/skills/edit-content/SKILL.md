---
name: 改站点内容
description: 改 data.js 站点事实（品牌/年份/链接）或调整首页结构文案位。触发：改站点信息、改邮箱/链接、改品牌、data.js、首页结构。
---

# 改站点内容

## 数据分工（先分清改哪里）

| 要改什么 | 改哪里 |
|---|---|
| **页面内容**（文章 / 笔记 / 任何正文） | `pages/<领域>/*.html` —— 见 `@add-page`，加完自动挂载，这里不用动 |
| 站点事实：品牌、年份、GitHub、邮箱 | `data.js` 的 `window.ZP.site` |
| 首页结构、导航、留白位 | `index.html`（**只放结构，不放散文**，见下方红线） |
| 首页如何渲染清单 | `app.js`（读 `window.ZP_MOUNT`） |

`data.js` 现在只有 `site` 一个块：

```js
window.ZP = {
  site: {
    brand:   'ZeroPhix',
    since:   '2023',
    github:  'https://github.com/zerophix',
    email:   'zerophix@users.noreply.github.com'
  }
};
```

- `email` 存裸地址，`app.js` 自动补 `mailto:`。
- 邮箱/链接别退回占位符（`hello@example.com`、`https://github.com/`）——曾是被修掉的缺陷。
- 首页计数、领域卡、页面列表全部来自 `mounted.js`（构建生成），**没有任何手写内容数据**。

## 文案红线

首页文案位（title / meta description / lead / 区块注释 / 关于正文 / 页脚语）一律**留白**，
只保留品牌、结构标签、功能按钮。**AI 不得代写内容文案**——曾整站编造后被全部清除，
`web-smoke` 有 `fabricated` 守卫断言，编造句一旦回流测试即 FAIL。

## 改完必须同步的测试

- 改 `site.*` → `web-smoke` 的 `brand` / `eyebrow` / `brandline` /
  `colophonBrand` / `colophonSince` / `githubHref` / `emailHref` / `ariaLabel` 断言。
- 加删页面 / 领域 → **不用改**（动态基线，从 `ZP_MOUNT` 推导期望值）。
- 改首页结构（增删区块、导航项）→ 同步 `navLinks`、`h1`、`cardOrder` 等结构断言。

## 注意

- 设计色 token 勿动：`--ink-3: #6f675e` 是 WCAG 4.5:1 达标色，改回旧色 axe 会报对比度违规。
- `mounted.js` / `sitemap.xml` 是生成物，禁止手改（改 `pages/` 源）。

## 验证

```sh
python3 -m http.server 8765 &          # 仓库根
node tests/web-smoke-test.js           # 填充 / 结构 / 设计 / 文案守卫
node tests/web-mount-test.js           # 挂载框架
BASE_URL=http://127.0.0.1:8765/ node tests/web-audit.js   # axe 报告（不带则打线上）
```
