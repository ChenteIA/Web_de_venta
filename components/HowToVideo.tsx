'use client';
import { useEffect, useRef } from 'react';

// Video "Cómo hacer tu pedido" (sin sonido, en bucle).
// - stage: en computadora va en la foto grande de la derecha y arranca desde el inicio cuando esa capa
//   se activa (al llegar a "Cómo pedir"); se pausa al salir.
// - sin stage: en el celular va dentro de la tarjeta y se reproduce mientras está a la vista.
// Con "reducir movimiento" no arranca solo: muestra la portada y los controles.
export default function HowToVideo({ stage = false }: { stage?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // iOS exige el atributo para reproducir solo
    const play = (fromStart: boolean) => {
      if (fromStart) v.currentTime = 0;
      v.play().catch(() => { v.controls = true; });
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.controls = true;
      return;
    }
    if (stage) {
      const layer = v.closest('.layer');
      const desktop = window.matchMedia('(min-width: 760px)');
      if (!layer) return;
      let wasOn = false;
      const sync = () => {
        const on = desktop.matches && layer.classList.contains('on');
        if (on && !wasOn) play(true);
        if (!on && wasOn) v.pause();
        wasOn = on;
      };
      const mo = new MutationObserver(sync);
      mo.observe(layer, { attributes: true, attributeFilter: ['class'] });
      desktop.addEventListener('change', sync);
      sync();
      return () => { mo.disconnect(); desktop.removeEventListener('change', sync); };
    }
    if (!('IntersectionObserver' in window)) { v.controls = true; return; }
    // display:none (en computadora) nunca "entra" en pantalla: así no se descarga dos veces
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) play(false);
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [stage]);
  return (
    <video
      ref={ref}
      className={stage ? 'stage-video' : 'itin-video'}
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
