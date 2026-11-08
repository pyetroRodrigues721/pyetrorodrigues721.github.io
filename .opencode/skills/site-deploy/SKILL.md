---
name: 站点发布
description: 推送 main 触发 GitHub Pages 构建，监控/重触发卡死构建，排查线上 404。触发：/发布、deploy、push、上线、Pages 构建、发布失败、线上404、构建卡住。
---

# 站点发布（GitHub Pages · zerophix.github.io）

## 正常流程

```sh
git add <明确列出本次改动路径>     # 禁止 git add -A（曾误发布草稿）
git commit -m "<type>(<scope>): <subject>"   # pre-commit 自动跑 Eleventy 挂载构建
git push origin main
```

提交时钩子会自动：构建 → 校验（失败即拦 commit）→ 暂存 `mounted.js`/`sitemap.xml`/
挂载页输出 → 清理孤儿输出。**不要 `--no-verify`**。

## 监控构建

```sh
gh api repos/zerophix/zerophix.github.io/pages/builds/latest \
  --jq '.status + " " + .commit[0:7]'
# 轮询到 "built <sha>" 即可；正常约 5 秒~1 分钟
```

## 卡住/排障

1. **线上样式旧 / 新区块错乱** = 访客端 `max-age=600` 缓存拿了「新 HTML + 旧 CSS/JS」。
   让对方硬刷新一次（macOS ⌘⇧R / Windows Ctrl+Shift+R）。构建已自动给资源引用加
   `?v=<内容哈希>`，此后新部署的 URL 必变，不会再发生。
2. **`building` 超过 2 分钟**（尤其伴随新增 `pages/*.html`）→ 重新触发：
   ```sh
   gh api repos/zerophix/zerophix.github.io/pages/builds -X POST
   ```
3. **`.nojekyll` 绝不能删**：没有它 GitHub Pages 会跑 Jekyll，正文里的 `{{` 会被当
   Liquid 处理，构建会卡死（历史故障，加 `.nojekyll` 后 5 秒构建）。
4. 线上 404 一个已提交的页面 → 依次查：
   - 构建状态是否 `built` 且 sha = 你的提交；
   - 输出目录 `<领域>/<页面>/index.html` 是否在仓库里（`git ls-files <领域>`）；
   - 钩子日志是否有「挂载完成：N 个领域已同步」。
5. 仓库 Pages 配置（分支 `main` / 根 `/`）：
   ```sh
   gh api repos/zerophix/zerophix.github.io/pages --jq '{status, source}'
   ```

## 发布后抽查

```sh
for u in "" "physics/2026_01/" "mounted.js" "sitemap.xml"; do
  printf "%s  /%s\n" "$(curl -s -o /dev/null -w '%{http_code}' https://zerophix.github.io/$u)" "$u"
done
curl -s https://zerophix.github.io/sitemap.xml | grep -c '<loc>'   # 应等于已知页面数
BASE_URL=https://zerophix.github.io/ node tests/web-smoke-test.js  # 线上冒烟
```

## 回滚

`git revert <sha>` 后照常推送（不要 force push main）；Pages 会用新提交重建。
