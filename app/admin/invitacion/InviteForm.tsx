'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

function friendly(msg: string) {
  if (/already registered|already been registered/i.test(msg)) return 'Ya existe una cuenta con ese correo. Ingresa desde la página de inicio de sesión.';
  if (/signups? not allowed|signup.*disabled/i.test(msg)) return 'El registro está cerrado en Supabase. El dueño debe activar "Allow new users to sign up" (ver README).';
  if (/database error saving new user/i.test(msg)) return 'Este enlace ya no es válido (se usó o venció). Pídele al dueño uno nuevo.';
  if (/password/i.test(msg)) return 'La contraseña no es válida: usa al menos 8 caracteres.';
  if (/rate limit|too many/i.test(msg)) return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  return 'No se pudo crear la cuenta. Inténtalo otra vez.';
}

export default function InviteForm({ token }: { token: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkMail, setCheckMail] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '').trim();
    const password = String(f.get('password') || '');
    if (password.length < 8) return setError('Usa una contraseña de al menos 8 caracteres.');
    if (password !== String(f.get('password2') || '')) return setError('Las contraseñas no coinciden.');
    setBusy(true);
    setError('');
    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password,
      options: { data: { invite: token }, emailRedirectTo: `${window.location.origin}/admin/login` },
    });
    if (error) {
      setBusy(false);
      setError(friendly(error.message));
      return;
    }
    // Si Supabase pide confirmar el correo, no hay sesión todavía.
    if (!data.session) {
      setBusy(false);
      setCheckMail(email);
      return;
    }
    window.location.assign('/admin');
  }

  if (checkMail) {
    return <p className="note">Listo. Te enviamos un correo a <b>{checkMail}</b>: ábrelo y confirma tu cuenta. Después <a href="/admin/login">ingresa aquí</a> con tu correo y contraseña.</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="field">Correo<input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" required /></label>
      <label className="field">Contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} enterKeyHint="next" required /><span className="hint">Al menos 8 caracteres.</span></label>
      <label className="field">Repite la contraseña<input name="password2" type="password" autoComplete="new-password" minLength={8} enterKeyHint="go" required /></label>
      <button type="submit" className="btn btn-dark" disabled={busy}>{busy ? 'Creando tu cuenta…' : 'Crear mi cuenta'}</button>
      <p className="err" role="alert">{error}</p>
    </form>
  );
}
