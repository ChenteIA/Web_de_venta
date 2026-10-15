// Datos del negocio. Para cambiar textos, precios o productos, edita este archivo.

export const BUSINESS = {
  name: 'El Puqui',
  tagline: 'Mermeladas y conservas artesanales en Mala, Cañete.',
  address: 'Calle Real 214, Mala (dirección de ejemplo)',
  hours: 'Martes a domingo, de 8:00 a. m. a 8:00 p. m.',
};

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51900000000').replace(/\D/g, '');

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  desc: string;
  icon: 'frasco' | 'fresa' | 'aguaymanto' | 'durazno' | 'encurtido' | 'caja';
  from?: boolean;
};

// La foto de cada producto es ./imagenes/<id>.jpg (por ejemplo ./imagenes/pie.jpg).
// Precios de ejemplo: cámbialos por los reales.
export const PRODUCTS: Product[] = [
  { id: 'mermelada-manzana', name: 'Mermelada de manzana delicia', price: 14, unit: 'frasco de 350 g', desc: 'Con la manzana del valle de Mala y un toque de canela. La que más piden.', icon: 'frasco' },
  { id: 'mermelada-fresa', name: 'Mermelada de fresa', price: 15, unit: 'frasco de 350 g', desc: 'Fresa entera cocida a fuego lento, con trozos de fruta. Ideal para el desayuno.', icon: 'fresa' },
  { id: 'mermelada-aguaymanto', name: 'Mermelada de aguaymanto', price: 16, unit: 'frasco de 350 g', desc: 'Dulce y ácida a la vez. Va muy bien con queso fresco o yogur.', icon: 'aguaymanto' },
  { id: 'duraznos-almibar', name: 'Duraznos en almíbar', price: 18, unit: 'frasco de 600 g', desc: 'Mitades de durazno en almíbar ligero. Para postres o solos, bien fríos.', icon: 'durazno' },
  { id: 'encurtido', name: 'Encurtido de verduras', price: 13, unit: 'frasco de 500 g', desc: 'Cebolla, zanahoria, vainita y ají amarillo en vinagre. Acompaña cualquier plato.', icon: 'encurtido' },
  { id: 'caja-regalo', name: 'Caja de regalo artesanal', price: 40, unit: 'desde, 3 frascos a elección', from: true, desc: 'Arma tu caja con tus sabores favoritos. Pídela con dos días de anticipación.', icon: 'caja' },
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
    ? `Hola ${BUSINESS.name}, quiero pedir: ${p.name} (S/ ${p.price}${p.from ? ' en adelante' : ''}). ¿Para qué fecha lo tienen disponible?`
    : `Hola ${BUSINESS.name}, quiero hacer una consulta sobre sus productos.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// 51900000000 → +51 900 000 000
export function waDisplay(n = WHATSAPP_NUMBER) {
  const m = n.match(/^(51)(\d{3})(\d{3})(\d{3})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${n}`;
}
