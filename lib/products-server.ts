import 'server-only';
import { normalize, PRODUCT_COLS } from './products';
import { PRODUCTS, type Product } from './site';
import { hasSupabase } from './supabase/config';
import { supabaseAnon } from './supabase/server';

// Productos visibles para la web pública, en el orden del panel. Si la base no responde, el respaldo de lib/site.ts.
export async function loadProducts(): Promise<Product[]> {
  if (!hasSupabase) return PRODUCTS;
  try {
    const { data, error } = await supabaseAnon().from('products').select(PRODUCT_COLS).eq('active', true).order('sort').order('name');
    if (error || !data) return PRODUCTS;
    return normalize(data);
  } catch {
    return PRODUCTS;
  }
}
