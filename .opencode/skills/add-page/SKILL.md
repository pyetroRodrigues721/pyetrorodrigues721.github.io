---
name: 挂载新页面
description: 把一个带 front matter 的 HTML 丢进 pages/ 自动挂载到全站（归档/领域计数/最近更新/筛选/sitemap）。触发：/挂载、新增页面、加一页、写个新页面、add page、pages 目录、挂载页。
---

# 挂载新页面（Eleventy 挂载框架）

## 流程

1. 复制模板（模板不参与构建，`_` 文件永远不发布）：
   ```sh
   cp pages/_template.njk pages/<slug>.html
   ```
2. 改 front matter（`---` 之间，**必须是文件开头**）：
   | 键 | 必填 | 规则 |
   |---|---|---|
   | `title` | 是 | 归档标题 |
   | `desc` | 是 | 一句说明 → 归档副标题 + 分享卡片 |
   | `field` | 是 | `web` `design` `tools` `lab` `books` `life` `photo`（须存在于 `data.js`） |
   | `type` | 是 | `w`=我写的 `p`=我做的 `t`=我试的 `c`=对话 |
   | `published` | 是 | `YYYY.MM`，**键名不能是 `date`**（Eleventy 保留键，YAML 解析成数字会 fatal） |
   | `og_image` | 否 | 分享卡片配图，如 `/og.png`；缺省用 `twitter:card=summary` |
3. 正文只写片段：**禁止 `<html>`/`<body>`**（校验会拦）。外壳（导航/页脚/夜读/SEO/
   canonical/og）由 `pages/_includes/layout.njk` 注入。正文里 `{{` 和 `{%` 原样输出
   （`htmlTemplateEngine:false`），代码示例不用转义。
4. 提交——pre-commit 钩子自动执行：构建 → 校验（不过就中止提交，报错会点名文件和字段）
   → 生成 `mounted.js` + `sitemap.xml` 并暂存 → `<slug>/index.html` 一并入库。
   ```sh
   git add pages/<slug>.html && git commit -m "feat(page): add <slug>"
   ```
5. 发布后地址：`https://zerophix.github.io/<slug>/`

## 删除页面

删掉 `pages/<slug>.html` 再提交，钩子检测到孤儿输出会自动
`rm -rf <slug>/` 并暂存删除（**不要手删输出目录**，源在输出就在）。

## 提交被拦截时

读钩子报错（`pages/xxx 挂载失败：- ...`），常见：field id 不存在、type 不是 w/p/t/c、
published 格式不是 YYYY.MM、输出目录已存在且非本框架生成（防覆盖）。
修 front matter 重试；**不要 `--no-verify`**。

## 验证

```sh
python3 -m http.server 8765 &                    # 仓库根
node tests/web-mount-test.js                     # 框架级：门禁/外壳/raw/收录/清理 19 项
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8765/<slug>/
```

线上发布后：
```sh
curl -s -o /dev/null -w '%{http_code}' https://zerophix.github.io/<slug>/
curl -s https://zerophix.github.io/sitemap.xml | grep -c <slug>
```

## 连带影响

- 挂载页会成为首页归档条目（计数 +1）→ 若是手工条目变动，
  同步 `tests/web-smoke-test.js` 的 `counter`/`kindCount`/`firstKind` 断言
  （挂载测试本身用动态基线，不用改）。
- 首页条目总数变了，`web-mount-test` 的基线自动跟随，无需干预。

## 集成测试文件

- 源：`pages/*.html` ｜ 校验与生成器：`eleventy.config.js`
- 外壳：`pages/_includes/layout.njk` ｜ 钩子：`githooks/pre-commit`
