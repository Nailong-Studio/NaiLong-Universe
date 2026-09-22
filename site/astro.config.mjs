// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import site from "./src/data/site.json" with { type: "json" }

// 站点部署在 GitHub Pages 的子路径：https://nailong-studio.github.io/website/
export default defineConfig({
  site: site.site,
  base: site.base.replace(/\/+$/, ""),
  output: "static",
  trailingSlash: "ignore",
  build: {
    assets: "_assets",
    inlineStylesheets: "auto",
  },
  image: {
    // 原图不在仓库内，统一走 CDN，禁用 Astro 本地图片服务
    service: { entrypoint: "astro/assets/services/noop" },
    remotePatterns: [{ protocol: "https", hostname: "wsrv.nl" }, { protocol: "https", hostname: "raw.githubusercontent.com" }],
  },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
})
