/** 数据模型 —— 与 scripts/build-artworks.mjs 输出严格对应 */
export interface Theme {
  id: string
  category: Category
  slug: string
  name: string
  en: string
  slogan: string
  description: string
  accent: string
  accent2: string
}

export type Category = "fullhd" | "classic" | "special" | "phone" | "art"

export interface Artwork {
  id: string
  slug: string
  category: Category
  theme: string
  file: string
  title: string
  variant: string
  story: string
  tags: string[]
  src: string
  thumb: string
  full: string
  view: string
  fullSrcset: string
  w: number
  h: number
  size: number
  dominant: string
  lqip: string
}

export interface CategoryInfo extends Theme {
  count: number
}

export interface Manifest {
  generatedAt: string
  count: number
  themes: Theme[]
  categories: CategoryInfo[]
  items: Artwork[]
}
