'use client';
import { useEffect } from 'react';

// La foto fija de la derecha cambia (fundido lento) a la que corresponde a la sección que se está leyendo.
// Cada sección dice qué foto quiere con data-stage="n"; las capas de la foto llevan data-layer="n".
export default function StageSync() {
  useEffect(() => {
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-layer]'));
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'));
    if (!layers.length || !sections.length || !('IntersectionObserver' in window)) return;
    const show = (n: string) => layers.forEach((l) => l.classList.toggle('on', l.dataset.layer === n));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show((e.target as HTMLElement).dataset.stage || '0');
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
