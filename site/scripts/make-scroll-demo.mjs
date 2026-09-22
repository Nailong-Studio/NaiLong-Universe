/**
 * 生成「画廊滚动」动图：用无头 Chrome 打开本地预览站的全部作品页，
 * 固定步长滚动并逐帧截图，再合成 docs/demo-scroll.webp（动图）与 docs/demo-scroll.gif。
 *
 * 依赖 puppeteer-core（可选依赖，不进主依赖树）：
 *   npm i -D puppeteer-core
 *   PUPPETEER_CHROME=/path/to/chrome npm run demo:scroll
 * 环境变量：
 *   DEMO_URL   默认 http://127.0.0.1:4321/website/ （先跑 npm run preview 或 dev）
 *   DEMO_PATH  默认 /gallery/
 *   PUPPETEER_CHROME  浏览器可执行文件路径（也可用 CHROME_PATH）
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const TMP = path.join(ROOT, '.cache/demo-scroll');
const BASE = process.env.DEMO_URL || 'http://127.0.0.1:4321/website';
const PAGE = process.env.DEMO_PATH || '/gallery/';
const EXEC = process.env.PUPPETEER_CHROME || process.env.CHROME_PATH;
const VW = Number(process.env.DEMO_W || 1000);
const VH = Number(process.env.DEMO_H || 625);
const DSF = Number(process.env.DEMO_DSF || 1.5);
const N = Number(process.env.DEMO_FRAMES || 36);
const DELAY = Number(process.env.DEMO_DELAY || 110);
const LAST_DELAY = Number(process.env.DEMO_LAST_DELAY || 900);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadPuppeteer() {
  try {
    return (await import('puppeteer-core')).default;
  } catch {
    console.error('需要 puppeteer-core：npm i -D puppeteer-core（并设置 PUPPETEER_CHROME）');
    process.exit(1);
  }
}

async function main() {
  const puppeteer = await loadPuppeteer();
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(DOCS, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: EXEC || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: VW, height: VH, deviceScaleFactor: DSF });
  await page.goto(BASE + PAGE, { waitUntil: 'networkidle2', timeout: 180000 });
  await page.evaluate(() => {
    try {
      localStorage.setItem('theme', 'dark');
    } catch {}
  });
  await page.reload({ waitUntil: 'networkidle2', timeout: 180000 });
  await sleep(2500);

  // 预热：滚动一遍触发懒加载与入场动画，再回到顶部
  const h0 = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h0; y += Math.floor(VH * 0.7)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(140);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1600);

  // 冻结动效，保证帧稳定（此时入场动画已结束）
  await page.addStyleTag({
    content: 'html{scroll-behavior:auto!important}*,*::before,*::after{transition:none!important;animation:none!important}',
  });
  await sleep(400);

  const max = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
  const bufs = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
    const y = Math.round(max * e);
    for (let a = 0; a < 6; a++) {
      const got = await page.evaluate((yy) => {
        window.scrollTo(0, yy);
        return window.scrollY;
      }, y);
      if (Math.abs(got - y) <= 1) break;
      await sleep(60);
    }
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await sleep(70);
    await page.screenshot({ path: `${TMP}/scroll-${String(i).padStart(2, '0')}.png`, captureBeyondViewport: false });
    bufs.push(await sharp(`${TMP}/scroll-${String(i).padStart(2, '0')}.png`).resize(900, 563, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer());
  }
  await browser.close();

  const delays = bufs.map((_, i) => (i === bufs.length - 1 ? LAST_DELAY : DELAY));
  const webp = await sharp(bufs, { join: { animated: true } })
    .webp({ quality: 70, effort: 5, loop: 0, delay: delays })
    .toBuffer();
  fs.writeFileSync(path.join(DOCS, 'demo-scroll.webp'), webp);
  let gifLen = 0;
  if (process.env.DEMO_GIF === '1') {
    const gif = await sharp(bufs, { join: { animated: true } })
      .gif({ loop: 0, delay: delays, effort: 8, dither: 1 })
      .toBuffer();
    fs.writeFileSync(path.join(DOCS, 'demo-scroll.gif'), gif);
    gifLen = gif.length;
  }
  console.log(
    `frames ${bufs.length} · webp ${(webp.length / 1048576).toFixed(2)} MB` + (gifLen ? ` · gif ${(gifLen / 1048576).toFixed(2)} MB` : ' (GIF 需 DEMO_GIF=1)'),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
