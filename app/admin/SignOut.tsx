'use client';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignOut() {
  return (
    <button
      type="button"
      className="view-toggle"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        window.location.assign('/admin/login');
      }}
    >
      Cerrar sesión
    </button>
  );
}
