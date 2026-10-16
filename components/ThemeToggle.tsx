'use client';
import { useEffect } from 'react';
import Icon from './icons';

const BAR = { light: '#FFFFFF', dark: '#191210' };

// La barra de estado del celular toma el color del encabezado del tema activo.
function syncThemeColor() {
  const forced = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    const scheme = forced || (m.getAttribute('media')?.includes('dark') ? 'dark' : 'light');
    m.setAttribute('content', BAR[scheme]);
  });
}

// Alterna entre modo claro y oscuro. Sin elección guardada, sigue al sistema.
export default function ThemeToggle() {
  useEffect(syncThemeColor, []);
  function toggle() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    syncThemeColor();
  }
  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label="Cambiar entre modo claro y oscuro" title="Modo claro / oscuro">
      <Icon name="moon" className="ic-moon" />
      <Icon name="sun" className="ic-sun" />
    </button>
  );
}
