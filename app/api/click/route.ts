import { NextResponse } from 'next/server';
import { PLACES, PRODUCTS } from '@/lib/site';
import { hasSupabase } from '@/lib/supabase/config';
import { supabaseAnon } from '@/lib/supabase/server';

const VALID_PRODUCTS = new Set(['general', ...PRODUCTS.map((p) => p.id)]);

// Guarda un clic a WhatsApp. La fecha, el día y la hora (America/Lima) los pone la base de datos.
export async function POST(req: Request) {
  let body: { product?: unknown; place?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const product = typeof body.product === 'string' ? body.product : '';
  const place = typeof body.place === 'string' ? body.place : '';
  if (!VALID_PRODUCTS.has(product) || !(place in PLACES)) return NextResponse.json({ ok: false }, { status: 400 });
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'supabase-not-configured' }, { status: 503 });

  const { error } = await supabaseAnon().from('clicks').insert({ product, place });
  if (error) {
    console.error('[click]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
