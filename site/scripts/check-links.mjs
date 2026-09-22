#!/usr/bin/env node
/**
 * 构建产物自检：在 dist/ 中抓取所有内部链接与资源引用，确认它们都能落到实际文件。
 * 目的：把"上线后 404"这类问题拦在 CI 里（历史缺陷：灯箱大图 404、家族导航 404）。
 *
 * 用法：node scripts/check-links.mjs [distDir]
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"
import { join, resolve } from "node:path"

const dist = resolve(process.argv[2] ?? "dist")
if (!existsSync(dist)) {
  console.error(`✖ 找不到构建目录：${dist}（先跑 npm run build）`)
  process.exit(1)
}

/** 递归收集所有 HTML 文件 */
function collectHtml(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) collectHtml(full, out)
    else if (entry.name.endsWith(".html")) out.push(full)
  }
  return out
}

const pages = collectHtml(dist)
const ATTR_RE = /(?:href|src|srcset)="([^"]+)"/g
const refs = new Set()

for (const page of pages) {
  const html = readFileSync(page, "utf8")
  let match
  while ((match = ATTR_RE.exec(html))) {
    // srcset 是逗号分隔的候选列表，每个候选取第一个 token（URL）
    for (const candidate of match[1].split(",")) {
      const raw = candidate.trim().split(/\s+/)[0]
      if (!raw) continue
      if (/^(https?:|#|mailto:|data:|tel:)/.test(raw)) continue
      refs.add(raw)
    }
  }
}

/** 站点基路径（与 src/data/site.json 保持一致，用于把绝对链接映射到 dist 文件） */
const BASE = JSON.parse(readFileSync(resolve("src/data/site.json"), "utf8")).base.replace(/\/+$/, "")

/** 把站内 URL 解析为候选文件路径 */
function candidates(ref) {
  let pathname = ref.split("#")[0].split("?")[0]
  if (pathname.startsWith(BASE + "/") || pathname === BASE) pathname = pathname.slice(BASE.length) || "/"
  if (!pathname.startsWith("/")) pathname = "/" + pathname
  try {
    pathname = decodeURIComponent(pathname)
  } catch {
    /* 保留原始编码形式 */
  }
  const target = join(dist, pathname)
  return [target, join(target, "index.html"), `${target.replace(/\/+$/, "")}.html`]
}

const missing = [...refs].filter((ref) => {
  const cands = candidates(ref)
  return !cands.some((c) => existsSync(c) && statSync(c).isFile())
})

// 缩略图完整性：清单里每条作品的缩略图都必须真实存在
const manifestPath = resolve("src/data/manifest.json")
let thumbReport = "（未找到 manifest.json，跳过缩略图检查）"
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  const items = manifest.artworks ?? manifest.items ?? []
  const missingThumbs = items.filter((item) => !existsSync(join(dist, item.thumb ?? "")))
  thumbReport = `${items.length} 件作品，缺失缩略图 ${missingThumbs.length} 张`
  for (const item of missingThumbs.slice(0, 10)) {
    console.error(`  MISSING THUMB ${item.id} → ${item.thumb}`)
  }
  if (missingThumbs.length) process.exitCode = 1
}

console.log(`页面数：${pages.length}`)
console.log(`内部引用：${refs.size} 个唯一目标`)
console.log(`缩略图：${thumbReport}`)

if (missing.length) {
  console.error(`✖ 有 ${missing.length} 个内部链接指向不存在的文件：`)
  for (const ref of missing.slice(0, 40)) console.error(`  ${ref}`)
  process.exit(1)
}
console.log("✔ 内部链接与缩略图全部命中")
