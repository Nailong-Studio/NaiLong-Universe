/* ============================================================
   site.ts — 全站客户端行为（渐进增强，无框架）
   1. 主题切换 / 专注模式（持久化 + 无闪烁）
   2. 移动端抽屉菜单
   3. 滚动进场 reveal（IntersectionObserver）
   4. 阅读进度条
   5. 图片加载淡入
   6. 灯箱（原生 <dialog>，键盘可达）
   7. 画廊即时过滤（chips 为真实链接，JS 可用时接管）
   ...
   与 Astro ClientRouter（View Transitions）协作：
   - astro:after-swap 恢复用户偏好与 html 标记
   - astro:page-load / DOMContentLoaded 触发 boot（同一文档幂等）
   - 全局 listener 统一挂 AbortSignal，换页后自动清理重绑
   ============================================================ */

let doc = document.documentElement
const STORE = { theme: "nl:theme", focus: "nl:focus" } as const

/* ---------- 1. 主题 / 专注模式 ---------- */
function readPref(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* 隐私模式忽略 */
  }
}

function initToggles() {
  const themeBtn = document.querySelector<HTMLButtonElement>("[data-toggle-theme]")
  themeBtn?.addEventListener("click", () => {
    const next = doc.dataset.theme === "light" ? "dark" : "light"
    doc.dataset.theme = next
    writePref(STORE.theme, next)
    themeBtn.setAttribute("aria-pressed", String(next === "light"))
    themeBtn.setAttribute("aria-label", next === "light" ? "切换到深色模式" : "切换到浅色模式")
    doc.classList.add("theme-anim")
    window.setTimeout(() => doc.classList.remove("theme-anim"), 480)
  })

  const focusBtn = document.querySelector<HTMLButtonElement>("[data-toggle-focus]")
  focusBtn?.addEventListener("click", () => {
    const next = doc.dataset.focus === "on" ? "off" : "on"
    doc.dataset.focus = next
    writePref(STORE.focus, next)
    focusBtn.setAttribute("aria-pressed", String(next === "on"))
    pauseDecor(next === "on")
  })
}

/* 减少动态效果：暂停 hero canvas 的 rAF */
function pauseDecor(paused: boolean) {
  window.dispatchEvent(new CustomEvent(paused ? "nl:pause-decor" : "nl:resume-decor"))
}

/* ---------- 2. 抽屉菜单 ---------- */
function initDrawer(sig: AbortSignal) {
  const drawer = document.querySelector<HTMLElement>("[data-drawer]")
  const toggle = document.querySelector<HTMLButtonElement>("[data-drawer-toggle]")
  if (!drawer || !toggle) return
  const setOpen = (open: boolean) => {
    drawer.dataset.open = String(open)
    drawer.toggleAttribute("inert", !open)
    toggle.setAttribute("aria-expanded", String(open))
    document.body.style.overflow = open ? "hidden" : ""
  }
  setOpen(false)
  toggle.addEventListener("click", () => setOpen(drawer.dataset.open !== "true"))
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)))
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && drawer.dataset.open === "true") setOpen(false)
    },
    { signal: sig }
  )
}

/* ---------- 3. 滚动进场 ---------- */
function initReveal() {
  const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]")
  if (!nodes.length) return
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => (n.dataset.revealed = "true"))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          const delay = Number(el.dataset.revealDelay ?? 0)
          window.setTimeout(() => (el.dataset.revealed = "true"), delay)
          io.unobserve(el)
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  )
  nodes.forEach((n) => io.observe(n))
}

/* ---------- 4. 阅读进度 ---------- */
function initProgress(sig: AbortSignal) {
  const bar = document.querySelector<HTMLElement>(".progress")
  if (!bar) return
  let raf = 0
  const update = () => {
    raf = 0
    const max = document.documentElement.scrollHeight - innerHeight
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
    bar.style.setProperty("--p", p.toFixed(4))
  }
  const nav = document.querySelector<HTMLElement>(".site-nav")
  const syncNav = () => {
    if (nav) nav.classList.toggle("is-scrolled", scrollY > 12)
  }
  addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(update)
      syncNav()
    },
    { passive: true, signal: sig }
  )
  update()
  syncNav()
}

/* ---------- 5. 图片淡入 ---------- */
function initImageFade() {
  const imgs = document.querySelectorAll<HTMLImageElement>("img[data-fade]")
  imgs.forEach((img) => {
    const done = () => (img.dataset.loaded = "true")
    if (img.complete && img.naturalWidth > 0) done()
    else {
      img.addEventListener("load", done, { once: true })
      img.addEventListener("error", done, { once: true })
    }
  })
}

/* ---------- 6. 灯箱 ---------- */
type LBItem = { full: string; srcset?: string; title: string; href: string; w: number; h: number }

function toItem(el: HTMLElement): LBItem {
  return {
    full: el.dataset.lbFull!,
    srcset: el.dataset.lbSrcset || undefined,
    title: el.dataset.lbTitle || "",
    href: el.dataset.lbHref || "",
    w: Number(el.dataset.lbW || 0),
    h: Number(el.dataset.lbH || 0),
  }
}

function collectItems(scope: ParentNode): LBItem[] {
  return Array.from(scope.querySelectorAll<HTMLElement>("[data-lb]")).map(toItem)
}

function initLightbox(sig: AbortSignal) {
  const dlg = document.querySelector<HTMLDialogElement>("[data-lightbox]")
  if (!dlg || typeof dlg.showModal !== "function") return
  const img = dlg.querySelector<HTMLImageElement>(".lightbox__img")!
  const caption = dlg.querySelector<HTMLElement>("[data-lb-caption]")!
  const openLink = dlg.querySelector<HTMLAnchorElement>("[data-lb-open]")!
  const counter = dlg.querySelector<HTMLElement>("[data-lb-counter]")!
  let items: LBItem[] = []
  let index = 0

  const render = () => {
    const it = items[index]
    if (!it) return
    img.src = it.full
    if (it.srcset) img.srcset = it.srcset
    else img.removeAttribute("srcset")
    img.alt = it.title
    if (it.w && it.h) {
      img.width = it.w
      img.height = it.h
    }
    caption.textContent = it.title
    counter.textContent = `${index + 1} / ${items.length}`
    openLink.href = it.href || it.full
    dlg.dataset.pending = "false"
  }

  const open = (list: LBItem[], i: number) => {
    items = list
    index = i
    render()
    dlg.showModal()
    document.body.style.overflow = "hidden"
  }

  const step = (delta: number) => {
    if (!items.length) return
    index = (index + delta + items.length) % items.length
    render()
  }

  document.addEventListener(
    "click",
    (e) => {
      const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-lb]")
      if (trigger) {
        e.preventDefault()
        const scope = trigger.closest<HTMLElement>("[data-lb-scope]") ?? document
        const els = Array.from(scope.querySelectorAll<HTMLElement>("[data-lb]"))
        const idx = Math.max(0, els.indexOf(trigger))
        open(els.map(toItem), idx)
        return
      }
      // 详情页大图也复用灯箱
      const solo = (e.target as HTMLElement).closest<HTMLElement>("[data-lb-solo]")
      if (solo) {
        e.preventDefault()
        open(collectItems(solo.parentElement ?? document), 0)
      }
    },
    { signal: sig }
  )

  dlg.querySelector("[data-lb-prev]")?.addEventListener("click", () => step(-1))
  dlg.querySelector("[data-lb-next]")?.addEventListener("click", () => step(1))
  dlg.querySelector("[data-lb-close]")?.addEventListener("click", () => dlg.close())
  dlg.addEventListener("close", () => {
    document.body.style.overflow = ""
    img.removeAttribute("src")
  })
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close()
  })
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1)
    if (e.key === "ArrowRight") step(1)
  })
}

/* ---------- 8. 光标柔光斑（桌面 + 非减弱动效） ---------- */
function initCursorGlow(sig: AbortSignal) {
  const g = document.querySelector<HTMLElement>(".cursor-glow")
  if (!g) return
  if (!matchMedia("(pointer: fine)").matches) return
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
  let x = innerWidth / 2
  let y = innerHeight / 2
  let tx = x
  let ty = y
  let raf = 0
  const tick = () => {
    raf = 0
    x += (tx - x) * 0.18
    y += (ty - y) * 0.18
    g.style.transform = `translate(${x}px, ${y}px)`
    if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(tick)
  }
  addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX
      ty = e.clientY
      if (!raf) raf = requestAnimationFrame(tick)
    },
    { passive: true, signal: sig }
  )
}

/* ---------- 9. 画廊即时过滤 ---------- */
function initFilter(sig: AbortSignal) {
  const bar = document.querySelector<HTMLElement>("[data-filterbar]")
  const grid = document.querySelector<HTMLElement>("[data-grid]")
  if (!bar || !grid) return
  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-cat]"))
  const counter = document.querySelector<HTMLElement>("[data-filter-count]")
  const chips = Array.from(bar.querySelectorAll<HTMLElement>("[data-chip]"))

  const apply = (cat: string, push: boolean) => {
    let shown = 0
    for (const card of cards) {
      const hit = cat === "all" || card.dataset.cat === cat
      if (hit) shown++
    }
    chips.forEach((c) => {
      if (c.dataset.chip === cat) c.setAttribute("aria-current", "page")
      else c.removeAttribute("aria-current")
    })
    if (counter) counter.textContent = `${shown} 件`
    if (push) {
      const target = chips.find((c) => c.dataset.chip === cat)?.getAttribute("href")
      if (target) history.pushState({ cat }, "", target)
    }
    document.dispatchEvent(new CustomEvent("nl:filtered", { detail: { cat, shown } }))

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      for (const card of cards) card.hidden = !(cat === "all" || card.dataset.cat === cat)
      return
    }
    grid.classList.add("is-filtering")
    window.setTimeout(() => {
      let i = 0
      for (const card of cards) {
        const hit = cat === "all" || card.dataset.cat === cat
        card.hidden = !hit
        if (hit) {
          card.classList.remove("is-enter")
          void card.offsetWidth
          card.style.setProperty("--enter-i", String(i++))
          card.classList.add("is-enter")
        }
      }
      grid.classList.remove("is-filtering")
    }, 220)
  }

  bar.addEventListener("click", (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>("[data-chip]")
    if (!chip) return
    e.preventDefault()
    apply(chip.dataset.chip!, true)
  })
  addEventListener("popstate", () => apply(currentCategory(), false), { signal: sig })

  function currentCategory(): string {
    const m = location.pathname.match(/gallery\/([a-z]+)\/?$/)
    return m ? m[1] : "all"
  }
  // 初始状态由服务端渲染决定，无需重复过滤
}

/* ---------- 10. 数字滚动计数（hero 统计） ---------- */
function initCountUp() {
  const els = document.querySelectorAll<HTMLElement>("[data-countup]")
  if (!els.length) return
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduce) return
  els.forEach((el) => {
    const txt = el.textContent ?? ""
    const m = txt.match(/^([^\d]*)([\d.,]+)(.*)$/s)
    if (!m) return
    const pre = m[1]
    const numStr = m[2].replace(/,/g, "")
    const post = m[3]
    const target = Number(numStr)
    if (!isFinite(target) || target <= 0) return
    const dur = 1100
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      el.textContent = pre + Math.round(target * e).toLocaleString("en-US") + post
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

/* ---------- 11. 详情页键盘翻页（← / → 跳上/下一件；灯箱打开时让行） ---------- */
function initArtworkPager(sig: AbortSignal) {
  const prev = document.querySelector<HTMLAnchorElement>("[data-pager-prev]")
  const next = document.querySelector<HTMLAnchorElement>("[data-pager-next]")
  if (!prev && !next) return
  const dlg = document.querySelector<HTMLDialogElement>("[data-lightbox]")
  const go = (el: HTMLAnchorElement | null) => {
    const href = el?.getAttribute("href")
    if (href) location.href = href
  }
  addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      if (dlg && dlg.open) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return
      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault()
        go(prev)
      } else if (e.key === "ArrowRight" && next) {
        e.preventDefault()
        go(next)
      }
    },
    { signal: sig }
  )
}

/* ---------- 12. 沉浸式漫游 Story（/story）：一屏一图 + 滚动换屏 + 横向长廊 + 进度条 ---------- */
function initStory(sig: AbortSignal) {
  const root = document.querySelector<HTMLElement>("[data-story]")
  if (!root) return
  const panes = Array.from(root.querySelectorAll<HTMLElement>("[data-pane]"))
  const progress = root.querySelector<HTMLElement>("[data-story-progress]")
  const hint = root.querySelector<HTMLElement>("[data-story-hint]")
  const stag = root.querySelector<HTMLElement>("[data-story-stag]")
  const stagNo = stag?.querySelector<HTMLElement>("[data-story-stag-no]") ?? null
  const stagName = stag?.querySelector<HTMLElement>("[data-story-stag-name]") ?? null
  // 横向长廊：横幅作品左右滑动
  const hall = root.querySelector<HTMLElement>("[data-hall]")
  const hallTrack = hall?.querySelector<HTMLElement>("[data-hall-track]") ?? null
  const slides = hallTrack ? Array.from(hallTrack.children) as HTMLElement[] : []
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  // 各屏中心的缓存（offsetTop 滚动时不变化，缓存避免每帧 reflow）
  let tops: number[] = []
  let active = -1
  let slideActive = -1
  let raf = 0
  const quiet = (n: number) => Math.max(-46, Math.min(46, n))

  const measure = () => {
    tops = panes.map((p) => p.offsetTop)
  }

  const updateStag = (no: string, name: string) => {
    if (stagNo) stagNo.textContent = no
    if (stagName) stagName.textContent = name
  }

  const updateHall = (): number => {
    if (!hallTrack || !slides.length) return 0
    // 使用视口坐标系（getBoundingClientRect），避免 offsetParent 不一致导致错位
    const viewMid = hallTrack.getBoundingClientRect().left + hallTrack.clientWidth / 2
    let idx = 0
    let best = Infinity
    for (let i = 0; i < slides.length; i++) {
      const r = slides[i].getBoundingClientRect()
      const mid = r.left + r.width / 2
      const d = Math.abs(mid - viewMid)
      if (d < best) {
        best = d
        idx = i
      }
    }
    if (idx !== slideActive) {
      const prev = slideActive
      if (slideActive >= 0) slides[slideActive].dataset.active = "false"
      slideActive = idx
      slides[idx].dataset.active = "true"
      slides[idx].style.setProperty("--dir", String(idx > prev ? 1 : idx < prev ? -1 : 1))
    }
    return idx
  }

  let stagKey = ""
  const setStag = (no: string, name: string) => {
    const k = `${no}|${name}`
    if (k === stagKey) return
    stagKey = k
    updateStag(no, name)
  }

  const update = () => {
    raf = 0
    const vh = innerHeight
    // 统一为相对 .story 的坐标系（与 tops / hall.offsetTop 一致）
    const at = scrollY + vh / 2 - root.offsetTop
    let idx = 0
    for (let i = 0; i < panes.length; i++) {
      const top = tops[i]
      const bottom = top + panes[i].offsetHeight
      if (at >= top && at < bottom) {
        idx = i
        break
      }
      if (at < top) break
    }
    if (idx !== active) {
      if (active >= 0) panes[active].dataset.active = "false"
      active = idx
      panes[active].dataset.active = "true"
      for (let i = 0; i < panes.length; i++) {
        panes[i].dataset.exited = String(i < active)
      }
    }
    // 滚动即叙事：图片按与视口中线的距离做反向景深视差（transform-only，60fps）
    for (let i = 0; i < tops.length; i++) {
      const c = tops[i] + panes[i].offsetHeight / 2
      const d = quiet((c - at) * -0.06)
      panes[i].style.setProperty("--depth", `${d}px`)
    }
    const hallIdx = updateHall()
    // 号牌：进入横廊区间显示横廊序号，其余显示纵向屏序号 + 展厅名
    if (hall && slides.length) {
      const hTop = hall.offsetTop
      const hBot = hTop + hall.offsetHeight
      if (at >= hTop && at < hBot) {
        setStag(`${String(hallIdx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`, "横廊 · HALL")
        stagKey = `pane|${active}` // 强制离开横廊时重写纵向号牌
      } else {
        const themeEn = panes[active].querySelector(".story__theme")?.textContent?.split("·")[0]?.trim() ?? ""
        setStag(`${String(active + 1).padStart(2, "0")} / ${String(panes.length).padStart(2, "0")}`, themeEn)
      }
    } else {
      const themeEn = panes[active].querySelector(".story__theme")?.textContent?.split("·")[0]?.trim() ?? ""
      setStag(`${String(active + 1).padStart(2, "0")} / ${String(panes.length).padStart(2, "0")}`, themeEn)
    }
    if (progress) {
      // 总进度 = 纵向滚动 + 横向长廊内折算
      const doc = document.documentElement.scrollHeight
      const scrollable = Math.max(1, doc - vh)
      let p = Math.min(1, Math.max(0, (scrollY + vh) / scrollable))
      if (hall && hallTrack && hallTrack.scrollWidth > hallTrack.clientWidth) {
        const h = hallTrack.scrollLeft / (hallTrack.scrollWidth - hallTrack.clientWidth)
        p = Math.min(1, p + h * (hall.offsetHeight / scrollable) * 0.6)
      }
      progress.style.scale = `${p} 1`
    }
    if (hint) hint.dataset.hidden = String(scrollY > vh * 0.4)
  }
  addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(update)
    },
    { passive: true, signal: sig }
  )
  if (hallTrack) {
    hallTrack.addEventListener(
      "scroll",
      () => {
        if (!raf) raf = requestAnimationFrame(update)
      },
      { passive: true, signal: sig }
    )
  }
  addEventListener("resize", update, { passive: true, signal: sig })
  measure()
  update()
  if (reduce) {
    panes.forEach((p) => {
      p.dataset.active = "true"
      p.dataset.exited = "false"
    })
    slides.forEach((s) => (s.dataset.active = "true"))
  }
}

/* ---------- 12b. Story 星尘粒子层（深空氛围，零依赖 2D canvas） ---------- */
function initStoryDust(sig: AbortSignal) {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-story-dust]")
  if (!canvas) return
  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) return
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (document.documentElement.dataset.focus === "on") return

  const palette = ["255,213,79", "102,187,106", "249,168,37", "254,249,237"]
  let w = 0
  let h = 0
  let dpr = 1
  let stars: { x: number; y: number; s: number; ph: number; vy: number }[] = []
  let raf = 0
  let paused = false
  let t = 0

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5)
    w = Math.max(1, innerWidth)
    h = Math.max(1, innerHeight)
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const n = Math.min(Math.round((w * h) / 42000), 64)
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: 0.5 + Math.random() * 1.5,
      ph: Math.random() * Math.PI * 2,
      vy: 0.08 + Math.random() * 0.22,
    }))
  }

  const frame = () => {
    raf = 0
    if (paused) return
    t += 0.016
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = "lighter"
    // 极淡柔光团，衬托画作
    for (let i = 0; i < 3; i++) {
      const bx = w * (0.2 + 0.6 * Math.sin(t * 0.08 + i * 2.1))
      const by = h * (0.75 + 0.25 * Math.sin(t * 0.07 + i * 4.2))
      const r = w * 0.22
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, r)
      g.addColorStop(0, `rgba(${palette[i]},0.05)`)
      g.addColorStop(1, `rgba(${palette[i]},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(bx, by, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // 缓慢上升的星尘
    for (const st of stars) {
      st.y -= st.vy
      if (st.y < -8) {
        st.y = h + 8
        st.x = Math.random() * w
      }
      const a = 0.16 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.2 + st.ph))
      ctx.fillStyle = `rgba(255,247,224,${a})`
      ctx.beginPath()
      ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = "source-over"
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (!raf && !paused) raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  resize()
  start()
  addEventListener("resize", resize, { passive: true, signal: sig })
  addEventListener(
    "visibilitychange",
    () => (document.hidden ? stop() : start()),
    { signal: sig }
  )
  addEventListener(
    "nl:pause-decor",
    () => {
      paused = true
      stop()
      ctx.clearRect(0, 0, w, h)
    },
    { signal: sig }
  )
  addEventListener(
    "nl:resume-decor",
    () => {
      paused = false
      start()
    },
    { signal: sig }
  )
}

/* ---------- 13. 背景音乐（Web Audio 模块级单例：跨页保活、零外部资源） ---------- */
const audio = {
  ctx: null as AudioContext | null,
  master: null as GainNode | null,
  nodes: [] as AudioNode[],
  playing: false,
  toggle() {
    this.playing ? this.stop() : this.start()
  },
  start() {
    if (this.playing) return
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    if (!this.ctx) this.ctx = new Ctor()
    const ac = this.ctx
    // iOS/移动端：首次手势后 AudioContext 常在 suspended，需要手动 resume
    if (ac.state === "suspended") void ac.resume()
    if (!this.master) {
      const m = ac.createGain()
      m.gain.value = 0
      m.connect(ac.destination)
      this.master = m
    }
    this.master.gain.cancelScheduledValues(ac.currentTime)
    this.master.gain.setValueAtTime(0, ac.currentTime)
    this.master.gain.linearRampToValueAtTime(0.2, ac.currentTime + 2.2)
    if (!this.nodes.length) {
      const now = ac.currentTime
      // 低八度根音 A2 + A3/C#4/E4/G#4 暖色和弦，音量比旧版更分明
      const chord = [110.0, 220.0, 277.18, 329.63, 415.3]
      chord.forEach((f, i) => {
        const o = ac.createOscillator()
        o.type = i === 0 ? "sine" : i % 2 === 0 ? "sine" : "triangle"
        o.frequency.value = f
        const g = ac.createGain()
        g.gain.value = i === 0 ? 0.15 : 0.11 / (chord.length - 1)
        // 极慢 LFO：每个音有轻微呼吸感
        const lfo = ac.createOscillator()
        lfo.frequency.value = 0.06 + i * 0.025
        const lg = ac.createGain()
        lg.gain.value = 0.05
        lfo.connect(lg)
        lg.connect(g.gain)
        o.connect(g)
        g.connect(this.master!)
        o.start(now + i * 0.35)
        lfo.start(now + i * 0.35)
        this.nodes.push(o)
      })
    }
    this.playing = true
  },
  stop() {
    if (this.nodes.length) {
      this.nodes.forEach((n) => {
        try {
          n.disconnect()
        } catch {
          /* ignore */
        }
      })
      this.nodes = []
    }
    if (this.master) {
      try {
        this.master.disconnect()
      } catch {
        /* ignore */
      }
      this.master = null
    }
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
    }
    this.playing = false
  },
}

function initMusic(sig: AbortSignal) {
  const btn = document.querySelector<HTMLButtonElement>("[data-music]")
  if (!btn) return
  const sync = () => {
    btn.dataset.playing = String(audio.playing)
    btn.setAttribute("aria-pressed", String(audio.playing))
    btn.setAttribute("aria-label", audio.playing ? "停止背景音乐" : "播放背景音乐")
  }
  sync() // 换页回来时恢复按钮态（音乐跨页继续播）
  btn.addEventListener(
    "click",
    () => {
      audio.toggle()
      sync()
    },
    { signal: sig }
  )
}

/* ---------- 启动（同一文档幂等；ClientRouter 换页后自动重跑） ---------- */
let bootAC: AbortController | null = null

function boot() {
  // 同一个文档只初始化一次；换页后 html 元素被替换，dataset 自然重置
  if (doc.dataset.booted === "1") return
  doc.dataset.booted = "1"

  // 清理上一页挂在 window/document 上的全局 listener，防止重复触发
  bootAC?.abort()
  bootAC = new AbortController()
  const sig = bootAC.signal

  // 换页可能带走了打开的灯箱状态
  document.body.style.overflow = ""

  initToggles()
  initDrawer(sig)
  initReveal()
  initProgress(sig)
  initImageFade()
  initLightbox(sig)
  initFilter(sig)
  initCursorGlow(sig)
  initCountUp()
  initArtworkPager(sig)
  initStory(sig)
  initStoryDust(sig)
  initMusic(sig)
}

/* ClientRouter 换页：html 元素被替换成新页面的服务端默认值，
   此处立即恢复用户偏好与 JS 标记，避免主题闪烁 */
document.addEventListener("astro:after-swap", () => {
  doc = document.documentElement
  doc.classList.add("js")
  const t = readPref(STORE.theme)
  if (t) doc.dataset.theme = t
  const f = readPref(STORE.focus)
  if (f) doc.dataset.focus = f
})

/* 首次加载（DOMContentLoaded）与每次 ClientRouter 导航（astro:page-load）都会触发 */
document.addEventListener("astro:page-load", boot)
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot)
else boot()
