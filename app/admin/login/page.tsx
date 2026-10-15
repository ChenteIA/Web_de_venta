import Header, { DemoStrip } from '@/components/Header';
import LoginForm from './LoginForm';
import { hasSupabase } from '@/lib/supabase/config';

export default function LoginPage() {
  return (
    <>
      <DemoStrip />
      <Header home="/" />
      <main className="wrap">
        <div className="login">
          <div>
            <h1>Panel del negocio</h1>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>Ingresa con el correo y la contraseña del dueño.</p>
          </div>
          {hasSupabase ? <LoginForm /> : <p className="err">Falta configurar Supabase: revisa las variables de entorno (.env.local).</p>}
        </div>
      </main>
    </>
  );
}
