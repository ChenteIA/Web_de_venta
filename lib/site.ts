// Datos del negocio. Para cambiar textos, precios o productos, edita este archivo.

export const BUSINESS = {
  name: 'El Puqui',
  tagline: 'Pastelería artesanal de manzana en Mala, Cañete.',
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
  icon: 'pie' | 'torta' | 'cumple' | 'alfajor' | 'empanada' | 'frasco';
  from?: boolean;
};

// La foto de cada producto es ./imagenes/<id>.jpg (por ejemplo ./imagenes/pie.jpg).
export const PRODUCTS: Product[] = [
  { id: 'pie', name: 'Pie de manzana delicia', price: 45, unit: 'entero, 8 porciones', desc: 'Masa quebrada de mantequilla, manzana delicia del valle y un toque de canela. El que más piden.', icon: 'pie' },
  { id: 'torta-canela', name: 'Torta de manzana y canela', price: 55, unit: 'molde de 22 cm', desc: 'Bizcocho húmedo con trozos de manzana, nueces y cobertura de caramelo.', icon: 'torta' },
  { id: 'cumple', name: 'Torta de cumpleaños personalizada', price: 90, unit: 'desde, para 15 personas', from: true, desc: 'Tú eliges el sabor, el relleno y el mensaje. Pídela con dos días de anticipación.', icon: 'cumple' },
  { id: 'alfajores', name: 'Alfajores de maicena', price: 18, unit: 'caja de 12', desc: 'Rellenos de manjar blanco y con coco rallado. Ideales para regalar.', icon: 'alfajor' },
  { id: 'empanadas', name: 'Empanadas de manzana', price: 15, unit: 'paquete de 6', desc: 'Hojaldre dorado relleno de compota de manzana casera.', icon: 'empanada' },
  { id: 'mermelada', name: 'Mermelada de manzana', price: 14, unit: 'frasco de 350 g', desc: 'Hecha en tandas pequeñas, sin conservantes. Va muy bien con queso fresco.', icon: 'frasco' },
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
