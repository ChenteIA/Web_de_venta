import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Protege /admin: sin sesión de Supabase, redirige al login.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === '/admin/login';
  // La página de invitación se abre sin sesión: ahí la persona invitada crea su usuario.
  const isInvite = request.nextUrl.pathname === '/admin/invitacion';

  let response = NextResponse.next({ request });
  let user = null;

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // getUser() valida el token con Supabase y refresca la sesión si hace falta.
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!user && !isLogin && !isInvite) {
    const to = request.nextUrl.clone();
    to.pathname = '/admin/login';
    to.search = '';
    return withHeaders(NextResponse.redirect(to), response);
  }
  if (user && isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = '/admin';
    to.search = '';
    return withHeaders(NextResponse.redirect(to), response);
  }
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

// Conserva las cookies de sesión refrescadas al redirigir.
function withHeaders(redirect: NextResponse, from: NextResponse) {
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  redirect.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return redirect;
}

export const config = {
  matcher: ['/admin/:path*'],
};
