'use client';
import { useState } from 'react';
import { WaIcon } from './Art';
import { countLabel, soles, waHref, waOrderHref, type Product } from '@/lib/site';

const QTYS = [1, 2, 3, 6, 12];

// Elige la cantidad: el total y el mensaje de WhatsApp cambian al instante.
// Sin JavaScript queda el enlace con 1 unidad, que funciona igual.
export default function OrderPicker({ product, presale, label: name = product.name }: { product: Product; presale: boolean; label?: string }) {
  const [qty, setQty] = useState(1);
  const label = countLabel(product.unit, qty);
  return (
    <div className="picker">
      <div className="qtys" role="radiogroup" aria-label={`Cuántas: ${name}`}>
        {QTYS.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={qty === n} onClick={() => setQty(n)}>
            {n === 1 ? countLabel(product.unit, 1) : n}
          </button>
        ))}
      </div>
      <p className="total" aria-live="polite">
        <span className="num">{soles(product.price * qty)}</span> por {label}
      </p>
      <div className="cells">
        <a className="cell cell-wa" data-wa="" data-product={product.id} data-place="carta" target="_blank" rel="noopener" href={waOrderHref(product, qty, presale)}>
          <WaIcon />
          {presale ? 'Separar' : 'Pedir'} {label}
        </a>
        <a className="cell cell-soft" data-wa="" data-product="general" data-place="carta" target="_blank" rel="noopener" href={waHref('general')}>
          Preguntar algo
        </a>
      </div>
    </div>
  );
}
