#!/usr/bin/env node
/**
 * verify-content.mjs —— 内容完整性校验（构建前置，失败即中断）
 * 1. manifest 与原始 gallery.json 条目数一致
 * 2. 每条作品的本地缩略图真实存在
 * 3. slug 在同一展厅内唯一、非空
 * 4. 展厅数量与分类统计一致
 * 5. 关键字段（title / dominant / lqip / full）齐全
 */
import { readFile, access } from "node:fs/promises"
import { constants } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const errors = []
const warn = []

const manifest = JSON.parse(await readFile(join(root, "src/data/manifest.json"), "utf8"))
const raw = JSON.parse(await readFile(join(root, "src/data/gallery.json"), "utf8"))
const themes = JSON.parse(await readFile(join(root, "src/data/themes.json"), "utf8"))

const rawItems = Array.isArray(raw) ? raw : (raw.items ?? [])

if (manifest.count !== rawItems.length) {
  errors.push(`作品数量不一致：manifest=${manifest.count}，gallery.json=${rawItems.length}`)
}
if (manifest.items.length !== manifest.count) {
  errors.push(`manifest.items 长度 ${manifest.items.length} ≠ count ${manifest.count}`)
}
if (themes.length !== manifest.categories.length) {
  errors.push(`展厅数量不一致：themes=${themes.length}，categories=${manifest.categories.length}`)
}

const themeCats = new Set(themes.map((t) => t.category))
for (const c of manifest.categories) {
  if (!themeCats.has(c.category)) errors.push(`分类 ${c.category} 没有对应的展厅定义`)
  const actual = manifest.items.filter((i) => i.category === c.category).length
  if (actual !== c.count) errors.push(`分类 ${c.category} 计数错误：${c.count} ≠ ${actual}`)
}

const seen = new Set()
for (const item of manifest.items) {
  const key = `${item.category}/${item.slug}`
  if (seen.has(key)) errors.push(`slug 重复：${key}`)
  seen.add(key)
  if (!item.slug) errors.push(`slug 为空：${item.id}`)
  if (!item.title) errors.push(`标题为空：${item.id}`)
  if (!item.dominant?.startsWith("#")) errors.push(`主色缺失或不合法：${item.id}（${item.dominant}）`)
  if (!item.lqip?.startsWith("data:image/")) errors.push(`LQIP 缺失：${item.id}`)
  if (!item.full?.startsWith("https://")) errors.push(`原图地址不合法：${item.id}（${item.full}）`)
  if (!/^wallpapers\//.test(item.src)) warn.push(`src 未带 wallpapers/ 前缀：${item.id}`)
  try {
    await access(join(root, "public", item.thumb), constants.R_OK)
  } catch {
    errors.push(`缩略图不存在：public/${item.thumb}`)
  }
}

if (warn.length) {
  console.log(`⚠️  ${warn.length} 条提示（不阻断构建）`)
  for (const w of warn.slice(0, 5)) console.log(`   · ${w}`)
}

if (errors.length) {
  console.error(`✖ 内容校验失败，共 ${errors.length} 个问题：`)
  for (const e of errors.slice(0, 30)) console.error(`   · ${e}`)
  process.exit(1)
}

console.log(
  `✔ 内容校验通过：${manifest.count} 件作品 · ${manifest.categories.length} 个展厅 · 缩略图全部就位`
)
