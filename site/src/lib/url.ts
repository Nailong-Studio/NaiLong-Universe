import site from "../data/site.json"

/**
 * 站点部署在 GitHub Pages 子路径（/NaiLong-Universe/）。
 * base 的唯一事实源是 src/data/site.json —— astro.config.mjs 与本文件都从它读取，
 * 避免"构建用 /NaiLong-Universe/、测试环境用 /"这类环境差异导致链接前缀不一致。
 */
export const BASE = site.base.replace(/\/+$/, "")

/** 统一的站内链接构造：自动带上 base 前缀 */
export function url(path = "/"): string {
  const clean = path.replace(/^\/+/, "")
  return clean ? `${BASE}/${clean}` : `${BASE}/`
}
