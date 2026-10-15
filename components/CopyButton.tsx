'use client';
import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setDone(true), () => {})}
    >
      {done ? 'Copiado' : 'Copiar'}
    </button>
  );
}
