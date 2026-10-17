'use client';
import { useEffect } from 'react';

// La foto fija de la derecha cambia (fundido lento) a la que corresponde a la sección que se está leyendo.
// Cada sección dice qué foto quiere con data-stage="…"; las capas de la foto llevan data-layer="…"
// (portada, una por producto como p-chicha-mani, y ancha).
export default function StageSync() {
  useEffect(() => {
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-layer]'));
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'));
    if (!layers.length || !sections.length || !('IntersectionObserver' in window)) return;
    const show = (n: string) => layers.forEach((l) => l.classList.toggle('on', l.dataset.layer === n));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show((e.target as HTMLElement).dataset.stage || 'portada');
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    // En el contacto ya están los botones de WhatsApp: el botón flotante se esconde para no tapar nada.
    const contact = document.getElementById('contacto');
    const io2 = new IntersectionObserver(([e]) => document.documentElement.classList.toggle('at-contact', e.isIntersecting), { rootMargin: '0px 0px -30% 0px' });
    if (contact) io2.observe(contact);
    return () => { io.disconnect(); io2.disconnect(); };
  }, []);
  return null;
}
