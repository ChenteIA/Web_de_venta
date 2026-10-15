// Ilustraciones SVG de la demo original.
import type { Product } from '@/lib/site';

function chord(cx: number, cy: number, r: number, offs: number[]) {
  return offs
    .map((o) => {
      const h = Math.sqrt(r * r - o * o);
      return `M${cx + o} ${(cy - h).toFixed(1)}V${(cy + h).toFixed(1)}M${(cx - h).toFixed(1)} ${cy + o}H${(cx + h).toFixed(1)}`;
    })
    .join('');
}

export function ProductIcon({ kind }: { kind: Product['icon'] }) {
  let inner: React.ReactNode;
  if (kind === 'pie') inner = (<><circle cx="60" cy="45" r="38" /><circle cx="60" cy="45" r="30" /><path d={chord(60, 45, 30, [-18, -6, 6, 18])} /></>);
  else if (kind === 'torta') inner = (<><path d="M14 80h92" /><rect x="22" y="48" width="76" height="30" rx="5" /><rect x="34" y="24" width="52" height="24" rx="5" /><path d="M34 34c6 6 10-4 16 2s10-4 16 2 10-4 16 2" /><path d="M50 18c2-6 8-8 12-6M60 12l2 6" /></>);
  else if (kind === 'cumple') inner = (<><path d="M14 80h92" /><rect x="26" y="46" width="68" height="32" rx="5" /><path d="M26 58c8 6 14-4 22 2s14-4 22 2 14-4 24 0" /><path d="M42 46V30M60 46V30M78 46V30" /><path d="M42 24c-3-3 0-8 0-8s3 5 0 8zM60 24c-3-3 0-8 0-8s3 5 0 8zM78 24c-3-3 0-8 0-8s3 5 0 8z" /></>);
  else if (kind === 'alfajor') inner = (<><rect x="24" y="16" width="72" height="16" rx="8" /><rect x="24" y="38" width="72" height="16" rx="8" /><rect x="24" y="60" width="72" height="16" rx="8" /><path d="M32 24h56M32 46h56M32 68h56" strokeDasharray="2 6" /></>);
  else if (kind === 'empanada') {
    let d = '';
    for (let a = 200; a <= 340; a += 20) {
      const t = (a * Math.PI) / 180;
      d += `M${(60 + 36 * Math.cos(t)).toFixed(1)} ${(66 + 36 * Math.sin(t)).toFixed(1)}L${(60 + 44 * Math.cos(t)).toFixed(1)} ${(66 + 44 * Math.sin(t)).toFixed(1)}`;
    }
    inner = (<><path d="M16 66a44 44 0 0 1 88 0z" /><path d={d} /><path d="M10 76h100" /></>);
  } else inner = (<><rect x="42" y="10" width="36" height="12" rx="3" /><rect x="34" y="22" width="52" height="60" rx="10" /><rect x="42" y="40" width="36" height="26" rx="4" /><circle cx="60" cy="54" r="7" /><path d="M60 47c0-3 2-5 5-5" /></>);
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{inner}</g>
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
