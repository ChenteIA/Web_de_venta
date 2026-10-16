import Icon from './icons';
// Ilustraciones SVG de San Luyo: se usan mientras no haya fotos en ./imagenes.
import type { Product } from '@/lib/site';

export function ProductIcon({ kind }: { kind: Product['icon'] }) {
  void kind;
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="52" y="4" width="16" height="8" rx="2" />
        <path d="M54 12v10c0 6-12 9-12 18v40a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V40c0-9-12-12-12-18V12" />
        <rect x="46" y="48" width="28" height="20" rx="3" />
        <path d="M42 40h36" />
      </g>
    </svg>
  );
}

// Maní con cáscara: dos lóbulos dorados (--crust / --crust-dark).
function Peanut({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path
        d="M0 -30c13 0 19 9 17 18-1 5-5 8-5 12s4 7 5 12c2 9-4 18-17 18s-19-9-17-18c1-5 5-8 5-12s-4-7-5-12c-2-9 4-18 17-18z"
        style={{ fill: 'var(--crust)', stroke: 'var(--crust-dark)', strokeWidth: 3 }}
      />
      <path d="M-7 -18h4M3 -14h4M-6 12h4M4 18h4M-1 -24h3M-1 22h3" style={{ stroke: 'var(--crust-dark)', strokeWidth: 3, strokeLinecap: 'round' }} />
    </g>
  );
}

// Botella de medio litro con chicha de maní, un vaso servido y maníes alrededor.
export function BottleArt() {
  const body = 'M182 128c0 26-40 34-40 68v120a14 14 0 0 0 14 14h88a14 14 0 0 0 14-14V196c0-34-40-42-40-68z';
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <clipPath id="sl-bottle"><path d={body} /></clipPath>
      </defs>
      <circle cx="200" cy="200" r="196" style={{ fill: 'var(--surface-2)' }} />
      <ellipse cx="206" cy="332" rx="150" ry="13" style={{ fill: 'var(--line)' }} />
      {/* Botella */}
      <rect x="182" y="84" width="36" height="48" style={{ fill: 'var(--bg)' }} />
      <path d={body} style={{ fill: 'var(--bg)' }} />
      <rect x="130" y="186" width="140" height="160" clipPath="url(#sl-bottle)" style={{ fill: 'var(--chicha)' }} />
      <rect x="156" y="200" width="10" height="110" rx="5" style={{ fill: '#fff', opacity: 0.3 }} />
      <rect x="160" y="228" width="80" height="62" rx="8" style={{ fill: 'var(--apple)' }} />
      <path d="M176 252h48M184 266h32" style={{ stroke: 'var(--crust)', strokeWidth: 5, strokeLinecap: 'round' }} />
      <rect x="176" y="60" width="48" height="28" rx="6" style={{ fill: 'var(--crust)' }} />
      <path d="M184 70h32M184 78h32" style={{ stroke: 'var(--crust-dark)', strokeWidth: 3, strokeLinecap: 'round' }} />
      {/* Vaso servido */}
      <path d="M282 238h62l-8 88a8 8 0 0 1-8 7h-30a8 8 0 0 1-8-7z" style={{ fill: 'var(--bg)' }} />
      <path d="M285 262h56l-5.8 64a8 8 0 0 1-8 7h-28.4a8 8 0 0 1-8-7z" style={{ fill: 'var(--chicha)' }} />
      <path d="M296 270v50" style={{ stroke: '#fff', strokeWidth: 6, strokeLinecap: 'round', opacity: 0.3 }} />
      {/* Maníes */}
      <Peanut x={96} y={312} r={-62} s={0.9} />
      <Peanut x={120} y={262} r={18} s={0.8} />
      <Peanut x={276} y={354} r={74} s={0.7} />
    </svg>
  );
}

// Maníes para el pie de página (dorado de masa).
export function PeanutsArt() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <Peanut x={150} y={140} r={-30} s={2.4} />
      <Peanut x={270} y={230} r={40} s={2.1} />
      <Peanut x={140} y={300} r={70} s={1.8} />
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" style={{ fill: 'var(--apple)' }} />
      <g transform="translate(20 20) rotate(-30) scale(0.42)">
        <path
          d="M0 -30c13 0 19 9 17 18-1 5-5 8-5 12s4 7 5 12c2 9-4 18-17 18s-19-9-17-18c1-5 5-8 5-12s-4-7-5-12c-2-9 4-18 17-18z"
          style={{ fill: 'var(--crust)' }}
        />
        <path d="M-7 -16h5M3 -12h5M-6 12h5M3 18h5" style={{ stroke: 'var(--crust-dark)', strokeWidth: 4, strokeLinecap: 'round' }} />
      </g>
    </svg>
  );
}

export function WaIcon() {
  return <Icon name="whatsapp" />;
}
