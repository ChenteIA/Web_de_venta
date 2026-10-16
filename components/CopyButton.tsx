'use client';
import { useState } from 'react';
import Icon from './icons';

export default function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setDone(true), () => {})}
    >
      <Icon name="copy" />
      {done ? 'Copiado' : label}
    </button>
  );
}
