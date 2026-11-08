---
name: 改站点内容
description: 编辑 data.js（站点信息/领域/条目）并同步受影响的测试断言。触发：加条目、加文章、改标题、改领域、改站点信息、改邮箱/链接、data.js、归档内容。
---

# 改站点内容（data.js 是唯一数据源）

首页所有内容数据都在 `data.js` 的 `window.ZP` 里，**不要把内容写进 `index.html`**。

## 结构

```js
window.ZP = {
  site:   { brand, tagline, since, github, email },   // 站点信息 → 填充 data-site 占位
  fields: [{ id, no, name, en, desc }],               // 领域册（id 必须唯一）
  items:  [{ f, type, date, t, s, u?, live? }]        // 归档条目
}
```

- `items[].f` = 领域 id；`type` = `w|p|t|c`；`date` = `YYYY.MM`（倒序排列用）。
- `u`：有链接才可点；不写 = 归档中灰色不可点行。
- `live: 1`：可作首页活体小窗（iframe 预览）的候选，取第一条带 `live` 且有 `u` 的条目。
- 领域卡的构成条/计数、归档筛选、最近更新、总数全部**自动派生**，不用手动维护。

## 改完必须同步的测试

`tests/web-smoke-test.js` 写死了计数类期望，条目数变化会直接 FAIL：

| 变更 | 需要改的断言 |
|---|---|
| 加/删条目 | `counter`、`filterCounter`、`searchCounter`（`共 N 条`）、`design.kindCount` |
| 改条目顺序/日期 | `design.firstKind`（归档首行的类型药丸文案） |
| 改 field 数量/结构 | `filterRows`（按领域筛选后的行数）、`fieldCards` |
| 改 `site.*` | `brand` / `eyebrow` / `brandline` / `colophonSince` / `githubHref` / `emailHref` |
| 改领域册本身 | `fieldCards`（= fields 数量） |

`web-mount-test` 用动态基线，**不用改**；`web-design` 只比样式 token，内容无关。

## 注意

- `email` 存裸地址（如 `zerophix@users.noreply.github.com`），`app.js` 自动补 `mailto:`。
- 邮箱/链接别退回占位符（`hello@example.com`、`https://github.com/`）——曾是被修掉的缺陷。
- 设计色 token 勿动：`--ink-3: #6f675e` 是 WCAG 4.5:1 达标色（与 code.html 统一），
  axe 会拦 133 个节点的对比度违规。

## 验证

```sh
python3 -m http.server 8765 &          # 仓库根
node tests/web-smoke-test.js           # 计数/填充/筛选/主题
node tests/web-audit.js                # axe、SEO、无 JS、移动端（默认打本地）
node tests/web-mount-test.js           # 归档收录基线
```
