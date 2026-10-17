import Header from '@/components/Header';
import { supabaseServer } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/supabase/config';
import InviteForm from './InviteForm';

export const dynamic = 'force-dynamic';

const MSG: Record<string, string> = {
  usada: 'Este enlace ya se usó. Cada enlace sirve una sola vez: pídele al dueño uno nuevo.',
  vencida: 'Este enlace venció (duran 7 días). Pídele al dueño uno nuevo.',
  invalida: 'Este enlace no es válido. Revisa que esté completo o pídele al dueño uno nuevo.',
};

// Enlace de un solo uso: quien lo abre crea su usuario y entra al panel.
export default async function InvitePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = '' } = await searchParams;
  let status = 'invalida';
  let signedIn = '';
  if (hasSupabase && /^[a-f0-9]{64}$/.test(t)) {
    const sb = await supabaseServer();
    const [{ data }, { data: { user } }] = await Promise.all([sb.rpc('invite_status', { p_token: t }), sb.auth.getUser()]);
    status = typeof data === 'string' ? data : 'invalida';
    signedIn = user?.email || '';
  }

  return (
    <>
      <Header home="/" />
      <main className="wrap">
        <div className="login">
          <div>
            <h1>Crea tu acceso al panel</h1>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>Te invitaron a administrar la web. Elige tu correo y una contraseña; con ellos entrarás siempre.</p>
          </div>
          {!hasSupabase ? (
            <p className="err">Falta configurar Supabase: revisa las variables de entorno.</p>
          ) : signedIn ? (
            <p className="note">Ya tienes una sesión abierta como <b>{signedIn}</b>. Si este enlace es para otra persona, envíaselo; si quieres usarlo tú con otro correo, primero cierra sesión. <a href="/admin">Ir al panel</a></p>
          ) : status === 'ok' ? (
            <InviteForm token={t} />
          ) : (
            <p className="err">{MSG[status] || MSG.invalida}</p>
          )}
        </div>
      </main>
    </>
  );
}
