'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(f.get('email') || '').trim(),
      password: String(f.get('password') || ''),
    });
    if (error) {
      setBusy(false);
      setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : 'No se pudo iniciar sesión. Inténtalo otra vez.');
      return;
    }
    window.location.assign('/admin');
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="field">Correo<input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" required /></label>
      <label className="field">Contraseña<input name="password" type="password" autoComplete="current-password" enterKeyHint="go" required /></label>
      <button type="submit" className="btn btn-dark" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      <p className="err" role="alert">{error}</p>
    </form>
  );
}
