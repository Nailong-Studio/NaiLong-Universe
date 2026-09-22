import manifestJson from "../data/manifest.json"
import type { Artwork, Category, Manifest, Theme } from "./types"

export const manifest = manifestJson as unknown as Manifest
export const artworks: Artwork[] = manifest.items
export const themes: Theme[] = manifest.themes
export const categories = manifest.categories

export const CATEGORY_ORDER: Category[] = ["fullhd", "classic", "special", "phone", "art"]

/** 按分类过滤；"all" 返回全部 */
export function filterByCategory(items: Artwork[], category: Category | "all"): Artwork[] {
  if (category === "all") return items
  return items.filter((i) => i.category === category)
}

export function themeOf(category: Category): Theme {
  return themes.find((t) => t.category === category) ?? themes[0]
}

export function countOf(category: Category | "all"): number {
  return category === "all" ? artworks.length : artworks.filter((a) => a.category === category).length
}

export function byCategory(category: Category): Artwork[] {
  return artworks.filter((a) => a.category === category)
}

export function findBySlug(category: Category, slug: string): Artwork | undefined {
  return artworks.find((a) => a.category === category && a.slug === slug)
}

/** 同展厅内的相邻作品，用于详情页上/下一件导航 */
export function neighbors(item: Artwork): { prev?: Artwork; next?: Artwork } {
  const list = byCategory(item.category)
  const idx = list.findIndex((a) => a.id === item.id)
  return { prev: idx > 0 ? list[idx - 1] : undefined, next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined }
}

/** 首页特选：优先人工标注 featured，其次各展厅首件 */
export function featured(limit = 8): Artwork[] {
  const picks: Artwork[] = []
  for (const c of CATEGORY_ORDER) {
    const first = byCategory(c)[0]
    if (first) picks.push(first)
  }
  for (const a of artworks) {
    if (picks.length >= limit) break
    if (!picks.includes(a)) picks.push(a)
  }
  return picks.slice(0, limit)
}

export function ratio(a: Artwork): number {
  return a.h / a.w
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
