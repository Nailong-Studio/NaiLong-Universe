import { defineConfig } from "vitest/config"

// 测试环境只需默认解析；站点 base 由 src/data/site.json 统一提供，
// 因此 url() 在测试与线上行为一致，不需要额外注入 import.meta.env。
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    reporters: "default",
  },
})
