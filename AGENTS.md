# ZeroPhix 站点 · 项目指令

静态博客 + 作品页，发布为用户站点 https://zerophix.github.io/ （GitHub Pages，主分支根目录）。
纯 HTML/CSS/JS；唯一的构建环节是 Eleventy 挂载框架（见下）。无打包器、无运行时框架。

## 文件地图

| 路径 | 角色 | 规则 |
|---|---|---|
| `index.html` | 首页模板（结构+文案） | 不含内容数据 |
| `data.js` | 站点数据唯一来源：`site` / `fields` / `items` | **改内容改这里** |
| `app.js` | 首页渲染与交互；`ITEMS = ZP.items + ZP_MOUNT.pages` | |
| `style.css` | 全站样式；`main.page` 段是挂载页正文样式 | |
| `code.html` | 作品页，**自包含内联样式** | 不要给它挂 `style.css`（`.chip`/`.row` 等选择器语义冲突） |
| `works/*.html` | 手写占位内容页（无 JS） | 由 `scripts/gen-works.js` 重生成 |
| `pages/*.html` | **挂载源**：front matter + 正文片段 | 加页面只改这里 |
| `pages/_template.njk` | 挂载页模板（`cp` 起步） | 不参与构建 |
| `pages/_includes/layout.njk` | 挂载页外壳（导航/页脚/夜读/SEO） | |
| `mounted.js`、`sitemap.xml`、`<slug>/` | **Eleventy 生成物** | **禁止手改**，改了下次构建覆盖；改源：`pages/`、`data.js` |
| `.nojekyll` | 关闭 GitHub Pages 的 Jekyll | **不可删除**（Jekyll 会处理 front matter 和 `{{`，构建会卡死） |
| `githooks/pre-commit` | 提交时自动构建挂载 | 钩子路径由 `npm install` 的 `postinstall` 设置（`core.hooksPath`） |
| `tests/` | 六套 Playwright 测试（见「验证」） | 用系统 Chrome（`channel:'chrome'`），无需下载浏览器 |
| `scripts/` | 资产生成脚本（works 占位页、OG 分享图） | |

## 常用命令

```sh
npm install                 # 首次：装依赖 + 自动接上提交钩子
npm run build               # Eleventy 构建（= node_modules/.bin/eleventy）
python3 -m http.server 8765 # 本地预览：在仓库根启动，http://127.0.0.1:8765/
node tests/web-smoke-test.js          # 六套测试之一，其余见下
BASE_URL=https://zerophix.github.io/ node tests/web-smoke-test.js   # 线上模式
```

测试套件：`web-smoke`（首页 39 断言+设计）、`web-audit`（axe/SEO/无 JS/移动端）、
`web-code`（作品页 23 断言）、`web-works`（6 占位页）、`web-design`（与 code.html 设计对拍）、
`web-mount`（挂载框架 19 项，自建临时页并清理，本地专有）。
除 `web-mount` 外都支持 `BASE_URL` 切线上；`web-design` 仅本地（要读 code.html 对拍）。

## 挂载框架规则（Eleventy）

1. 新页面：`cp pages/_template.njk pages/my-post.html`，front matter 必填
   `title` / `desc` / `field`（web design tools lab books life photo）/
   `type`（w 写 / p 做 / t 试 / c 聊）/ `published`（YYYY.MM）。
2. **日期键必须叫 `published`，不能叫 `date`**（Eleventy 保留键，YAML 数字直接 fatal）。
3. 正文只写片段，**不要 `<html>`/`<body>`**（外壳由 layout 注入）；正文里 `{{`、`{%`
   原样输出（`htmlTemplateEngine:false`），写代码示例无需转义。
4. 提交即挂载：pre-commit 跑构建 → 校验（领域 id/类型/日期/防覆盖，不过就拦提交）→
   生成 `mounted.js`+`sitemap.xml` 并暂存 → 源文件删除时自动下架孤儿输出。
   **不要用 `--no-verify` 绕过**；克隆新环境若找不到 eleventy，先 `npm install`。

## 内容与设计约定

- 改条目/领域/站点信息 = 改 `data.js`；归档、领域计数、最近更新、筛选、计数全部自动更新。
- **新增/删除条目后必须同步 `tests/web-smoke-test.js` 的计数断言**
  （`counter`/`filterCounter`/`searchCounter`/`kindCount`/`firstKind`，
  以及 `sections.featRows`——精选作品行数 = `type:p` 且有 `u` 的条目数）；
  改 `index.html` 技术栈支柱词条则同步 `sections.pillarLis`、`sections.spectrumVals`
  与支柱头部的 `p-meta` 计数；`web-mount` 已用动态基线，不用改。
- 设计基准是 `code.html`：配色/字体/组件与其对拍（`tests/web-design-test.js` 28 项）。
  `--ink-3` 与 `--muted` 统一为 `#6f675e`（WCAG 4.5:1 达标色，**勿改回 `#837c73`**）。
- 夜读键是 `localStorage['zp-ink']`（`paper`/`night`），跨首页、作品页、挂载页共享。
- 文件名只用 ASCII；提交信息走 `<type>(<scope>): <subject>`（英文，主题 ≤72 字符）。
- **不要用 `git add -A`**：曾把草稿 `code.html` 误发布；逐个列出本次要提交的路径。

## 验证（完成任何改动前必须跑）

1. 起本地服务（仓库根，8765 端口），跑受影响的测试套件；**改首页相关逻辑 = 六套全跑**。
2. 全绿才算完成；测试有断言失败就先修测试或修代码，不许跳过。
3. 涉及发布的行为（挂载/删除页面）额外跑 `node tests/web-mount-test.js`。

## 部署

- `git push origin main` → Pages 构建（有 `.nojekyll` 后约 5 秒）。
- 查构建：`gh api repos/zerophix/zerophix.github.io/pages/builds/latest --jq '.status'`
- 构建卡在 `building` 超过 2 分钟 = 异常，重新触发：
  `gh api repos/zerophix/zerophix.github.io/pages/builds -X POST`
- 上线后抽查：`curl -s -o /dev/null -w '%{http_code}' https://zerophix.github.io/<path>/`

## 项目 Skills（按需加载）

- `@add-page`：挂载一个新页面的完整流程与坑
- `@edit-content`：改 `data.js` 内容与连带的测试期望
- `@site-verify`：本地/线上验证套件的跑法与判读
- `@site-deploy`：推送、Pages 构建监控与排障
