'use client';
import { useEffect } from 'react';

// Registra cada clic en un enlace de WhatsApp (a[data-wa]) sin frenar la apertura de WhatsApp.
export default function WaTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.('a[data-wa]');
      if (!a) return;
      const body = JSON.stringify({ product: a.getAttribute('data-product'), place: a.getAttribute('data-place') });
      try {
        if (navigator.sendBeacon && navigator.sendBeacon('/api/click', new Blob([body], { type: 'application/json' }))) return;
      } catch {}
      fetch('/api/click', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
