'use client';
import { useState } from 'react';
import { WaIcon } from './Art';
import { waHref, waOrderHref } from '@/lib/site';

const QTYS = [1, 2, 3, 6, 12];

// Elige cuántas botellas: el total y el mensaje de WhatsApp cambian al instante.
// Sin JavaScript queda el enlace con 1 botella, que funciona igual.
export default function OrderPicker({ productId, price, presale }: { productId: string; price: number; presale: boolean }) {
  const [qty, setQty] = useState(1);
  const total = price * qty;
  return (
    <div className="picker">
      <div className="qtys" role="radiogroup" aria-label="Cuántas botellas">
        {QTYS.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={qty === n} onClick={() => setQty(n)}>
            {n === 1 ? '1 botella' : n}
          </button>
        ))}
      </div>
      <p className="total" aria-live="polite">
        <span className="num">S/ {total}</span> por {qty === 1 ? '1 botella' : `${qty} botellas`}
      </p>
      <div className="cells">
        <a className="cell cell-wa" data-wa="" data-product={productId} data-place="carta" target="_blank" rel="noopener" href={waOrderHref(productId, qty, presale)}>
          <WaIcon />
          {presale ? 'Separar' : 'Pedir'} {qty === 1 ? '1 botella' : `${qty} botellas`}
        </a>
        <a className="cell cell-soft" data-wa="" data-product="general" data-place="carta" target="_blank" rel="noopener" href={waHref('general')}>
          Preguntar algo
        </a>
      </div>
    </div>
  );
}
