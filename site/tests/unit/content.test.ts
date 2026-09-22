import { describe, expect, it } from "vitest"
import {
  artworks,
  byCategory,
  categories,
  countOf,
  filterByCategory,
  themeOf,
  themes,
} from "../../src/lib/artworks"
import { url } from "../../src/lib/url"

describe("内容清单", () => {
  it("总共 134 件作品", () => {
    expect(artworks.length).toBe(134)
  })

  it("五个展厅的计数与站点导航一致", () => {
    expect(byCategory("art").length).toBe(36)
    expect(byCategory("classic").length).toBe(38)
    expect(byCategory("fullhd").length).toBe(22)
    expect(byCategory("phone").length).toBe(29)
    expect(byCategory("special").length).toBe(9)
  })

  it("countOf 覆盖 all 与各分类", () => {
    expect(countOf("all")).toBe(134)
    expect(countOf("art")).toBe(36)
    expect(countOf("special")).toBe(9)
  })

  it("每个分类都有展厅定义", () => {
    for (const c of categories) {
      expect(themes.some((t) => t.category === c.category)).toBe(true)
      expect(themeOf(c.category).category).toBe(c.category)
    }
  })
})

describe("过滤", () => {
  it("all 返回全部", () => {
    expect(filterByCategory(artworks, "all")).toHaveLength(134)
  })

  it("按展厅过滤只保留该展厅作品", () => {
    const classic = filterByCategory(artworks, "classic")
    expect(classic).toHaveLength(38)
    expect(classic.every((a) => a.category === "classic")).toBe(true)
  })
})

describe("数据质量", () => {
  it("slug 在同一展厅内唯一且非空", () => {
    const seen = new Set<string>()
    for (const a of artworks) {
      expect(a.slug).toBeTruthy()
      const key = `${a.category}/${a.slug}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it("每条作品都有主色与 LQIP", () => {
    for (const a of artworks) {
      expect(a.dominant).toMatch(/^#[0-9a-f]{6}$/i)
      expect(a.lqip.startsWith("data:image/webp;base64,")).toBe(true)
    }
  })

  it("原图地址指向公开的壁纸仓库", () => {
    for (const a of artworks) {
      expect(a.full).toContain("raw.githubusercontent.com/Nailong-Studio/wallpaper/")
      expect(a.fullSrcset).toContain("wsrv.nl")
    }
  })
})

describe("链接构造", () => {
  it("站内链接带 base 前缀", () => {
    expect(url("/gallery/")).toBe("/website/gallery/")
    expect(url("thumbs/art/naiwa_01.webp")).toBe("/website/thumbs/art/naiwa_01.webp")
  })

  it("根路径不加多余斜杠", () => {
    expect(url("/")).toBe("/website/")
  })
})
