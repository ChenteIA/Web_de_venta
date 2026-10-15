import { WaIcon } from './Art';
import { waHref, type Place } from '@/lib/site';

export default function WaLink({ product, place, className = 'btn btn-wa', children, label }: { product: string; place: Place; className?: string; children: React.ReactNode; label?: string }) {
  return (
    <a className={className} data-wa="" data-product={product} data-place={place} target="_blank" rel="noopener" href={waHref(product)} aria-label={label}>
      <WaIcon />
      {children}
    </a>
  );
}
