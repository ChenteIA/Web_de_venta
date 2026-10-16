// Datos del negocio. Para cambiar textos, precios o productos, edita este archivo.

export const BUSINESS = {
  name: 'San Luyo',
  tagline: 'Chicha de maní casera, hecha en Ica.',
  address: 'Ica, Perú',
  hours: 'Abierto 24/7, todos los días del año.',
};

// Día en que empiezan las ventas (hora de Lima). Antes de esa fecha la portada lo anuncia.
export const LAUNCH = { day: '2026-10-19', label: 'el lunes 19 de octubre' };

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51910897377').replace(/\D/g, '');

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  desc: string;
  icon: 'botella';
  from?: boolean;
};

// La foto de cada producto es ./imagenes/<id>.jpg (por ejemplo ./imagenes/chicha-mani.jpg).
// PRECIO DE EJEMPLO: cámbialo por el real.
export const PRODUCTS: Product[] = [
  { id: 'chicha-mani', name: 'Chicha de maní', price: 5, unit: 'botella de 500 ml', desc: 'Hecha en casa con maní tostado. Cremosa, dulce en su punto y para tomarla bien helada.', icon: 'botella' },
];

export const PLACES = { portada: 'Botón de la portada', carta: 'Botón de cada producto', flotante: 'Botón flotante' } as const;
export type Place = keyof typeof PLACES;

export function prod(id: string | null | undefined) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function prodName(id: string | null | undefined) {
  const p = prod(id);
  if (p) return p.name;
  if (id === 'general') return 'Consulta general';
  if (id === 'otro') return 'Otro producto';
  return id || 'Otro';
}

export function waHref(productId: string) {
  const p = prod(productId);
  const msg = p
    ? `Hola ${BUSINESS.name}, quiero pedir ${p.name.toLowerCase()} (${p.unit}, S/ ${p.price}${p.from ? ' en adelante' : ' c/u'}). Quiero ___ botellas para el día ___.`
    : `Hola ${BUSINESS.name}, quiero hacer una consulta sobre la chicha de maní.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// 51910897377 → +51 910 897 377
export function waDisplay(n = WHATSAPP_NUMBER) {
  const m = n.match(/^(51)(\d{3})(\d{3})(\d{3})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${n}`;
}
