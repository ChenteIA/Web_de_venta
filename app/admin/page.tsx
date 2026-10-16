import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Icon from '@/components/icons';
import { supabaseServer } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/supabase/config';
import Panel from './Panel';
import SignOut from './SignOut';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!hasSupabase) redirect('/admin/login');
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: isAdmin } = await sb.rpc('is_admin');

  return (
    <>
      <Header home="/admin">
        <a className="view-toggle" href="/"><Icon name="arrow-right-up" />Ver la web</a>
        <SignOut />
      </Header>
      {isAdmin ? (
        <Panel />
      ) : (
        <main className="wrap panel">
          <div className="locked">
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 34 }}>Este panel es solo para el dueño</h1>
            <p style={{ color: 'var(--muted)' }}>Tu cuenta ({user.email}) no tiene permiso de administrador. Pídele al dueño del negocio que te agregue.</p>
          </div>
        </main>
      )}
    </>
  );
}
