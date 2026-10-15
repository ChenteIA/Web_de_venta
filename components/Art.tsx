// Ilustraciones SVG de la demo original.
import type { Product } from '@/lib/site';

const JAR = (<><rect x="42" y="10" width="36" height="12" rx="3" /><rect x="34" y="22" width="52" height="60" rx="10" /></>);

export function ProductIcon({ kind }: { kind: Product['icon'] }) {
  let inner: React.ReactNode;
  if (kind === 'fresa') inner = (<>{JAR}<path d="M60 44c-9 0-13 6-11 12s6 10 11 13c5-3 9-7 11-13s-2-12-11-12z" /><path d="M53 44l7-5 7 5" /><path d="M56 52h0M64 52h0M60 58h0M56 62h0M64 62h0" strokeWidth="4" /></>);
  else if (kind === 'aguaymanto') inner = (<>{JAR}<circle cx="60" cy="56" r="9" /><path d="M60 47c-10-6-16 2-14 10M60 47c10-6 16 2 14 10M60 47v-5" /></>);
  else if (kind === 'durazno') inner = (<><rect x="44" y="6" width="32" height="10" rx="3" /><rect x="38" y="16" width="44" height="68" rx="9" /><path d="M46 46a9 9 0 0 1 18 0zM56 64a9 9 0 0 1 18 0z" /><path d="M38 34h44" /></>);
  else if (kind === 'encurtido') inner = (<><rect x="44" y="6" width="32" height="10" rx="3" /><rect x="38" y="16" width="44" height="68" rx="9" /><circle cx="51" cy="34" r="5" /><circle cx="68" cy="44" r="5" /><path d="M46 58h12M62 62h12M48 72h10" /><path d="M66 70c2-8 8-12 10-18" /></>);
  else if (kind === 'caja') inner = (<><rect x="22" y="38" width="76" height="44" rx="4" /><rect x="16" y="26" width="88" height="14" rx="3" /><path d="M60 26v56" /><path d="M60 26c-6-12-22-12-18-2 2 4 12 4 18 2zM60 26c6-12 22-12 18-2-2 4-12 4-18 2z" /></>);
  else inner = (<>{JAR}<rect x="42" y="40" width="36" height="26" rx="4" /><circle cx="60" cy="54" r="7" /><path d="M60 47c0-3 2-5 5-5" /></>);
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{inner}</g>
    </svg>
  );
}

// Frascos de mermelada y conserva con tapas doradas (--crust / --crust-dark).
function Jar({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  const lw = w - 16;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={20} style={{ fill }} />
      <rect x={x + 10} y={y + 14} width={9} height={h - 40} rx={4.5} style={{ fill: '#fff', opacity: 0.22 }} />
      <rect x={x + 14} y={y + h * 0.38} width={w - 28} height={h * 0.3} rx={8} style={{ fill: 'var(--bg)' }} />
      <path d={`M${x + 26} ${y + h * 0.5}H${x + w - 26}M${x + 32} ${y + h * 0.58}H${x + w - 32}`} style={{ stroke: 'var(--crust-dark)', strokeWidth: 5, strokeLinecap: 'round' }} />
      <rect x={x + 8} y={y - 30} width={lw} height={34} rx={7} style={{ fill: 'var(--crust)' }} />
      <path d={`M${x + 16} ${y - 18}H${x + 8 + lw - 8}M${x + 16} ${y - 8}H${x + 8 + lw - 8}`} style={{ stroke: 'var(--crust-dark)', strokeWidth: 4, strokeLinecap: 'round' }} />
    </g>
  );
}

export function JarsArt() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <circle cx="200" cy="200" r="196" style={{ fill: 'var(--surface-2)' }} />
      <ellipse cx="200" cy="324" rx="150" ry="14" style={{ fill: 'var(--line)' }} />
      <Jar x={62} y={192} w={104} h={132} fill="var(--filling)" />
      <Jar x={238} y={212} w={100} h={112} fill="var(--leaf)" />
      <Jar x={142} y={150} w={116} h={174} fill="var(--apple)" />
    </svg>
  );
}

// Pie enrejado con la masa dorada (--crust / --crust-dark).
export function PieArt({ plate = true }: { plate?: boolean }) {
  const cx = 200, cy = 200, r = 150;
  const line = (o: number) => Math.sqrt(r * r - o * o) - 6;
  const horiz = [-81, -27, 27, 81].map((o) => `M${(cx - line(o)).toFixed(1)} ${cy + o}H${(cx + line(o)).toFixed(1)}`).join('');
  const vert = [-108, -54, 0, 54, 108].map((o) => `M${cx + o} ${(cy - line(o)).toFixed(1)}V${(cy + line(o)).toFixed(1)}`).join('');
  const dots = Array.from({ length: 40 }, (_, k) => {
    const t = (k / 40) * Math.PI * 2;
    return <circle key={k} cx={(cx + 168 * Math.cos(t)).toFixed(1)} cy={(cy + 168 * Math.sin(t)).toFixed(1)} r="9" style={{ fill: 'var(--crust-dark)' }} />;
  });
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      {plate && <circle cx="200" cy="200" r="196" style={{ fill: 'var(--surface-2)' }} />}
      <circle cx="200" cy="200" r={r} style={{ fill: 'var(--filling)' }} />
      <g transform="rotate(-18 200 200)" style={{ fill: 'none', strokeLinecap: 'round' }}>
        <path d={horiz} style={{ stroke: 'var(--crust-dark)', strokeWidth: 28 }} />
        <path d={horiz} style={{ stroke: 'var(--crust)', strokeWidth: 22 }} />
        <path d={vert} style={{ stroke: 'var(--crust-dark)', strokeWidth: 28 }} />
        <path d={vert} style={{ stroke: 'var(--crust)', strokeWidth: 22 }} />
      </g>
      <circle cx="200" cy="200" r={r + 6} style={{ fill: 'none', stroke: 'var(--crust)', strokeWidth: 22 }} />
      {dots}
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="22" r="15" style={{ fill: 'var(--apple)' }} />
      <path d="M20 8c0-3 2-5 5-5" style={{ fill: 'none', stroke: 'var(--leaf)', strokeWidth: 2.5, strokeLinecap: 'round' }} />
      <path d="M21 9c3-4 8-4 10-2-2 3-6 4-10 2z" style={{ fill: 'var(--leaf)' }} />
      <path d="M11 22h18M14 16h12M14 28h12" style={{ stroke: 'var(--crust)', strokeWidth: 2.5, strokeLinecap: 'round' }} />
    </svg>
  );
}

export function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}
