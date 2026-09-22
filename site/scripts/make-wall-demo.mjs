/**
 * 生成「作品墙总览」动图：把 public/thumbs 下所有缩略图拼成方阵，
 * 再做一次从近到远的拉远运镜，输出 docs/demo-wall.webp（动图）与 docs/demo-wall.gif。
 *
 * 仅依赖 sharp（已在 devDependencies / dependencies 中）。用法：npm run demo:wall
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const THUMBS = path.join(ROOT, 'public/thumbs');
const DOCS = path.join(ROOT, 'docs');
const TMP = path.join(ROOT, '.cache/demo');
const COLS = 12;
const CELL = Number(process.env.WALL_CELL || 400);
const SIZE = COLS * CELL;
const FW = Number(process.env.DEMO_W || 900);
const FH = Number(process.env.DEMO_H || 563);
const N = Number(process.env.DEMO_FRAMES || 30);
const DELAY = Number(process.env.DEMO_DELAY || 110);
const LAST_DELAY = Number(process.env.DEMO_LAST_DELAY || 900);

/** 固定种子的洗牌，保证每次生成的墙一致 */
function mulberry(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

async function buildMosaic() {
  const cats = fs.readdirSync(THUMBS).filter((d) => fs.statSync(path.join(THUMBS, d)).isDirectory()).sort();
  const list = [];
  for (const cat of cats) {
    for (const f of fs.readdirSync(path.join(THUMBS, cat)).filter((x) => x.endsWith('.webp')).sort()) {
      list.push(path.join(THUMBS, cat, f));
    }
  }
  const rnd = mulberry(20260910);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const composites = [];
  for (let i = 0; i < list.length && i < COLS * COLS; i++) {
    composites.push({
      input: await sharp(list[i]).resize(CELL, CELL, { fit: 'cover' }).toBuffer(),
      left: (i % COLS) * CELL,
      top: Math.floor(i / COLS) * CELL,
    });
  }
  const out = path.join(TMP, 'mosaic.png');
  await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 18, g: 18, b: 18 } } })
    .composite(composites)
    .png({ compressionLevel: 6 })
    .toFile(out);
  console.log(`mosaic: ${list.length} thumbs -> ${SIZE}x${SIZE} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB)`);
  return out;
}

async function encode(bufs, name) {
  const delays = bufs.map((_, i) => (i === bufs.length - 1 ? LAST_DELAY : DELAY));
  const webp = await sharp(bufs, { join: { animated: true } })
    .webp({ quality: 70, effort: 5, loop: 0, delay: delays })
    .toBuffer();
  fs.writeFileSync(path.join(DOCS, `${name}.webp`), webp);
  let gifLen = 0;
  if (process.env.DEMO_GIF === '1') {
    const gif = await sharp(bufs, { join: { animated: true } })
      .gif({ loop: 0, delay: delays, effort: 8, dither: 1 })
      .toBuffer();
    fs.writeFileSync(path.join(DOCS, `${name}.gif`), gif);
    gifLen = gif.length;
  }
  console.log(
    `${name}: webp ${(webp.length / 1048576).toFixed(2)} MB` + (gifLen ? ` / gif ${(gifLen / 1048576).toFixed(2)} MB` : ' (GIF 需 DEMO_GIF=1)'),
  );
}

async function main() {
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(DOCS, { recursive: true });
  const mosaic = await buildMosaic();

  const bufs = [];
  for (let i = 0; i < N; i++) {
    const e = easeInOut(i / (N - 1));
    const cw = Math.round(SIZE * (1 - 0.62 * e));
    const ch = Math.round((cw * FH) / FW);
    const left = Math.max(0, Math.min(SIZE - cw, Math.round((0.34 + 0.22 * e) * SIZE - cw / 2)));
    const top = Math.max(0, Math.min(SIZE - ch, Math.round((0.38 + 0.16 * e) * SIZE - ch / 2)));
    bufs.push(await sharp(mosaic).extract({ left, top, width: cw, height: ch }).resize(FW, FH, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer());
  }
  await encode(bufs, 'demo-wall');

  await sharp(mosaic).resize(2400, 2400).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(DOCS, 'artworks-wall.jpg'));
  console.log('done: docs/demo-wall.webp · docs/demo-wall.gif · docs/artworks-wall.jpg');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
