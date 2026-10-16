'use client';
import { useEffect } from 'react';

// Muestra los elementos [data-reveal] al entrar en pantalla, una sola vez.
// La clase .js-reveal la pone el script del <head> antes de pintar, así sin JS todo se ve igual.
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-visible', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-visible', '');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
