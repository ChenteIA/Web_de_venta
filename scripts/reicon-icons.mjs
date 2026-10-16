// Copia los iconos de Reicon (https://github.com/dqev/reicon, licencia MIT) que usa la web
// a components/icons.tsx, para no instalar el paquete completo (25 MB).
//
// Uso:
//   git clone --depth 1 https://github.com/dqev/reicon /tmp/reicon
//   node scripts/reicon-icons.mjs /tmp/reicon
//
// Para añadir un icono, agrega su nombre a ICONS (búscalo en https://reicon.dev/icons) y vuelve a ejecutar.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ICONS = [
  'sun', 'moon',                                  // cambio de tema
  'calendar', 'truck', 'wallet',                  // datos de la portada
  'map-point', 'clock', 'copy',                   // pie de página
  'refresh', 'stars2', 'download2', 'upload2',    // panel
  'eye', 'eye-closed', 'trash2', 'logout', 'arrow-right-up',
  'pen', 'add-circle', 'chart', 'box', 'bag', 'gallery',  // pestañas y productos del panel
];
const BRANDS = { whatsapp: 'WhatsApp' };

const src = process.argv[2];
if (!src) {
  console.error('Uso: node scripts/reicon-icons.mjs <ruta al repo de reicon>');
  process.exit(1);
}
const data = JSON.parse(readFileSync(path.join(src, 'data', 'icon-data.json'), 'utf8'));
const brands = JSON.parse(readFileSync(path.join(src, 'data', 'brands.json'), 'utf8')).icons;
const all = {};
for (const c of Object.values(data.categories)) Object.assign(all, c.icons);

const out = {};
for (const name of ICONS) {
  const icon = all[name];
  if (!icon) throw new Error(`No existe el icono "${name}" en Reicon`);
  // Las formas solo de contorno (stroke sin fill) no deben heredar el relleno del <svg>.
  const body = icon.weights.Outline.code.trim().replace(/<(path|circle|rect|ellipse|line|polyline|polygon)\b(?![^>]*\bfill=)(?=[^>]*\bstroke=)/g, '<$1 fill="none"');
  out[name] = { viewBox: '0 0 24 24', body };
}
for (const [key, brandName] of Object.entries(BRANDS)) {
  const b = (Array.isArray(brands) ? brands : Object.values(brands)).find((x) => x.name === brandName);
  if (!b) throw new Error(`No existe la marca "${brandName}" en Reicon`);
  const viewBox = b.svg.match(/viewBox="([^"]+)"/)[1];
  // Logo en un solo color: toma el color del texto (currentColor).
  const body = b.svg.replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="currentColor"');
  out[key] = { viewBox, body };
}

const file = `// Generado por scripts/reicon-icons.mjs — no editar a mano.
// Iconos de Reicon (https://reicon.dev), licencia MIT. Basados en Solar Icons de 480 Design (CC BY 4.0).
const ICONS = ${JSON.stringify(out, null, 2)} as const;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, size, className }: { name: IconName; size?: number; className?: string }) {
  const icon = ICONS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
`;
writeFileSync(new URL('../components/icons.tsx', import.meta.url), file);
console.log(`components/icons.tsx: ${Object.keys(out).length} iconos`);
