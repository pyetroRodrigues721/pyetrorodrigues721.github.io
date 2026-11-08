---
name: 站点验证
description: 起本地服务并跑六套 Playwright 测试（本地或线上），判读 axe/设计对拍/计数断言。触发：/验证、跑测试、test、检查页面、跑一遍、审计、axe、验证站点。
---

# 站点验证（六套 Playwright 测试）

## 准备

```sh
cd <仓库根>
python3 -m http.server 8765 &        # 测试默认打 http://127.0.0.1:8765/
```
测试用**系统 Chrome**（`channel:'chrome'`），playwright 已是 `devDependencies`，
无需 `playwright install`、无需 `NODE_PATH`。

## 六套套件

| 套件 | 覆盖 | 关键断言 |
|---|---|---|
| `web-smoke` | 首页 | 21 结构 + 18 设计断言：计数、模板填充、筛选/搜索、夜读、hover 动效 |
| `web-audit` | 全站质量 | axe 违规=0、SEO 元信息、无 JS 降级、375px 无溢出、性能 |
| `web-code` | `code.html` | 23 断言：链接审计、SEO、doc 非链接化、主题三态、axe=0 |
| `web-works` | `works/*` | 6 占位页 200、样式、无外部 JS |
| `web-design` | 设计对拍 | style.css vs code.html：28 项 token/计算样式逐值相等（**仅本地**） |
| `web-mount` | 挂载框架 | 19 项：门禁拦截、外壳注入、raw 正文、归档收录、清理还原（**仅本地**，自建临时页） |

## 线上模式

```sh
BASE_URL=https://zerophix.github.io/ node tests/web-smoke-test.js
BASE_URL=https://zerophix.github.io node tests/web-works-test.js
```
除 `web-design` / `web-mount` 外都支持 `BASE_URL`（后两者依赖本地文件/本地构建）。

## 判读

- 任一 FAIL = 未完成，先修再收尾；不许跳过或删断言了事。
- 计数类 FAIL（`共 N 条`）通常是内容增删没同步
  `tests/web-smoke-test.js` → 见 `@edit-content`。
- `web-audit` 的 `axe` 数组非空 → 逐条修（对比度问题检查 `--ink-3` 是否被改回旧色）。
- `known` 区的 `works/*` 404 是历史缺口提示（占位页已建后应为空）。
- `web-design` 差异明细会打印 `index=... code=...`，按对拍逐项收敛；
  字体栈只比首字体，回退链差异不算失败。

## 提交前最低要求

改首页相关逻辑 → **六套全跑全绿**；只改挂载页源 → `web-mount` + 线上抽查即可。
提交钩子会再跑一次 Eleventy 构建，校验失败会拦住 commit。
