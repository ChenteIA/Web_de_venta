// Productos: lectura desde Supabase (tabla "products") y URL pública de sus fotos (bucket "productos").
import { IMAGES, largest, srcSet, type ImgSet } from './images';
import { PRODUCTS, type Product } from './site';
import { SUPABASE_URL } from './supabase/config';

export const PRODUCTS_BUCKET = 'productos';
export const PRODUCT_COLS = 'id, name, price, unit, description, photo_path, active, sort';

export function normalize(rows: Partial<Product>[]): Product[] {
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name || ''),
    price: Number(r.price) || 0,
    unit: String(r.unit || ''),
    description: String(r.description || ''),
    photo_path: r.photo_path || null,
    active: r.active !== false,
    sort: Number(r.sort) || 0,
  }));
}

export function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCTS_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

// Foto para mostrar: la subida desde el panel; si no hay, la de ./imagenes/<id>.jpg optimizada en el build.
export type ProductPhoto = { src: string; srcSet?: string; width?: number; height?: number };
export function productPhoto(p: Product): ProductPhoto | null {
  if (p.photo_path) return { src: photoUrl(p.photo_path) };
  const set: ImgSet | undefined = IMAGES.products[p.id];
  return set ? { src: largest(set), srcSet: srcSet(set), width: set.width, height: set.height } : null;
}

export { PRODUCTS as FALLBACK_PRODUCTS };
