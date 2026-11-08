---
name: 站点验证
description: 起本地服务并跑三套 Playwright 测试（本地或线上），判读 axe/动态基线/文案守卫。触发：/验证、跑测试、test、检查页面、跑一遍、审计、axe、验证站点。
---

# 站点验证（三套 Playwright 测试）

## 准备

```sh
cd <仓库根>
python3 -m http.server 8765 &        # web-smoke / web-mount 默认打 http://127.0.0.1:8765/
```
测试用**系统 Chrome**（`channel:'chrome'`），playwright 已是 `devDependencies`，
无需 `playwright install`、无需 `NODE_PATH`。

## 三套套件

| 套件 | 覆盖 | 关键断言 |
|---|---|---|
| `web-smoke` | 首页 | 动态基线（领域卡/页面行 = `ZP_MOUNT` 计数）、站点信息填充、**文案守卫 `fabricated: []`**、设计 12 项、hover 动效、夜读切换 |
| `web-mount` | 挂载框架 | 24 项：门禁（散装/缺 html/缺 title）、原样发布（无外壳注入、raw 保留）、清单与 sitemap、首页收录、点开可达、孤儿下架、清理还原（**仅本地**，自建临时页） |
| `web-audit` | 全站质量 | 报告：axe 违规、SEO 元信息、标题层级、链接/锚点、无 JS 降级、375px 溢出、性能（**默认打线上**，`BASE_URL` 切本地） |

## 线上模式

```sh
BASE_URL=https://zerophix.github.io/ node tests/web-smoke-test.js
node tests/web-audit.js                              # 本来就打线上
```
`web-mount` 依赖本地文件与本地构建，只在本地跑。

## 判读

- 任一 FAIL = 未完成，先修再收尾；不许跳过或删断言了事。
- `fabricated` 非空 → 有人往首页写了表述性散文（红线，见 AGENTS.md）→ 删掉散文，不是改断言。
- `web-audit` 的 `axe` 数组非空 → 逐条修（对比度问题检查 `--ink-3` 是否被改回 `#837c73`）。
- 测试对 `fonts.gstatic.com` 的超时/失败按环境因素豁免（境内中文分片慢，不计失败）；
  页面加载等待用 `domcontentloaded` + 渲染完成，**不要改回 `networkidle`**（会超时）。
- 计数类 FAIL 通常意味着挂载清单与 DOM 不一致 → 重新 `npm run build` 再跑。

## 提交前最低要求

改首页/框架 → `web-smoke` + `web-mount` 全绿，`web-audit` 看 axe=0；
只加页面 → `web-mount` + 线上抽查即可。提交钩子会再跑一次 Eleventy 构建，校验失败拦 commit。
