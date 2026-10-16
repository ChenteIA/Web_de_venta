'use client';
import { useRef, useState } from 'react';

export type PublicReview = { id: string; url: string; who: string; caption: string };

export default function ReviewsGallery({ reviews }: { reviews: PublicReview[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState<PublicReview | null>(null);

  function open(r: PublicReview) {
    setZoom(r);
    dlg.current?.showModal?.();
  }
  function close() { dlg.current?.close?.(); }

  return (
    <>
      <div className="reviews">
        {reviews.map((r, i) => (
          <figure className="review" key={r.id} data-reveal="" style={{ '--i': i % 4 } as React.CSSProperties}>
            <button type="button" onClick={() => open(r)} aria-label={`Ampliar captura de ${r.who}`}>
              <img loading="lazy" decoding="async" src={r.url} alt={`Captura de un mensaje de WhatsApp de ${r.who}`} />
            </button>
            <figcaption><b>{r.who}</b>{r.caption}</figcaption>
          </figure>
        ))}
      </div>
      <dialog className="lightbox" ref={dlg} aria-label="Captura ampliada" onClick={(e) => { if (e.target === dlg.current) close(); }}>
        {zoom && <img src={zoom.url} alt={`Captura de un mensaje de WhatsApp de ${zoom.who}`} />}
        <button type="button" className="btn btn-sm btn-dark close" onClick={close}>Cerrar</button>
      </dialog>
    </>
  );
}
