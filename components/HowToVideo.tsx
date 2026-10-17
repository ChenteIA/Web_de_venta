'use client';
import { useEffect, useRef } from 'react';

// Video "Cómo hacer tu pedido": se reproduce solo, sin sonido y en bucle mientras está a la vista.
// Con "reducir movimiento" no arranca solo: muestra la portada y los controles.
export default function HowToVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // iOS exige el atributo para reproducir solo
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="itin-video"
      muted
      loop
      playsInline
      preload="none"
      poster="/video/como-pedir.webp"
      width={864}
      height={1080}
      aria-label="Video de 20 segundos: cómo hacer tu pedido en 5 pasos (elige en la web, nos escribes por WhatsApp, te confirmamos, pagas y te la llevamos)"
    >
      <source src="/video/como-pedir.mp4" type="video/mp4" />
      <source src="/video/como-pedir.webm" type="video/webm" />
    </video>
  );
}
