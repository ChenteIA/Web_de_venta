'use client';
import Icon from '@/components/icons';
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
      <Icon name="logout" />
      Cerrar sesión
    </button>
  );
}
