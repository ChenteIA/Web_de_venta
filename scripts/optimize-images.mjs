// Convierte las fotos de ./imagenes a WebP en varios tamaños y genera lib/images.json.
//   portada.jpg  → portada
//   logo.png     → logo del encabezado + favicon
//   <id>.jpg     → foto del producto con ese id (ver lib/site.ts)
// Si falta una imagen, la web usa la ilustración SVG de la demo.
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'imagenes');
const OUT = path.join(ROOT, 'public', 'img');
const MANIFEST = path.join(ROOT, 'lib', 'images.json');
const EXT = /\.(jpe?g|png|webp|avif)$/i;

const manifest = { portada: null, logo: null, favicon: false, products: {} };

async function variants(file, name, widths, quality = 78) {
  const img = sharp(file).rotate();
  const meta = await img.metadata();
  const srcW = meta.autoOrient?.width ?? meta.width;
  const srcH = meta.autoOrient?.height ?? meta.height;
  // Tamaños pedidos que caben en la foto; si la foto es más chica que el mayor, también su ancho original.
  const ws = widths.filter((w) => w <= srcW);
  if (srcW < Math.max(...widths) && !ws.includes(srcW)) ws.push(srcW);
  const out = [];
  for (const w of ws) {
    const rel = `${name}-${w}.webp`;
    await sharp(file).rotate().resize({ width: w }).webp({ quality }).toFile(path.join(OUT, rel));
    out.push({ w, src: `/img/${rel}` });
  }
  return { width: srcW, height: srcH, srcs: out };
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, 'productos'), { recursive: true });
  for (const f of ['favicon-32.png', 'apple-touch-icon.png']) await rm(path.join(ROOT, 'public', f), { force: true });

  const files = existsSync(SRC) ? (await readdir(SRC)).filter((f) => EXT.test(f)) : [];
  if (!files.length) console.log('[imagenes] No hay fotos en ./imagenes: se usarán las ilustraciones SVG.');

  for (const f of files) {
    const file = path.join(SRC, f);
    const base = path.basename(f, path.extname(f)).toLowerCase();
    if (base === 'portada') {
      manifest.portada = await variants(file, 'portada', [640, 960, 1440], 74);
    } else if (base === 'logo') {
      manifest.logo = await variants(file, 'logo', [64, 128], 90);
      await sharp(file).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(ROOT, 'public', 'favicon-32.png'));
      await sharp(file).resize(180, 180, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toFile(path.join(ROOT, 'public', 'apple-touch-icon.png'));
      manifest.favicon = true;
    } else {
      const id = base.replace(/[^a-z0-9-]+/g, '-');
      manifest.products[id] = await variants(file, `productos/${id}`, [400, 800], 76);
    }
    console.log(`[imagenes] ${f} listo`);
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

main().catch((e) => {
  console.error('[imagenes] Error:', e.message);
  process.exit(1);
});
