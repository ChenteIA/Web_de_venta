// Datos del negocio. Para cambiar textos, precios o productos, edita este archivo.
import { today } from './time';

export const BUSINESS = {
  name: 'San Luyo',
  tagline: 'Chicha de maní casera, hecha en Ica.',
  address: 'Ica, Perú',
  hours: 'Abierto 24/7, todos los días del año.',
};

// Día de las primeras entregas (hora de Lima). Antes de esa fecha la web funciona como PREVENTA:
// los botones dicen "Separar" y el mensaje de WhatsApp pide la botella para esa fecha.
// Desde ese día la web pasa sola a venta normal.
export const LAUNCH = { day: '2026-10-19', label: 'el lunes 19 de octubre', short: 'el lunes 19' };

export function isPresale() {
  return today() < LAUNCH.day;
}

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51910897377').replace(/\D/g, '');

// Un producto de la carta. En producción viven en la tabla "products" de Supabase (se editan desde /admin);
// PRODUCTS es el respaldo cuando la base no está configurada o no responde.
export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string; // "botella de 500 ml"
  description: string;
  photo_path?: string | null; // foto en el bucket "productos"
  active?: boolean;
  sort?: number;
};

export const PRODUCTS: Product[] = [
  { id: 'chicha-mani', name: 'Chicha de maní', price: 3, unit: 'botella de 500 ml', description: 'Hecha en casa con maní tostado. Cremosa, dulce en su punto y para tomarla bien helada.', sort: 0 },
  { id: 'chicha-mani-litro', name: 'Chicha de maní', price: 6, unit: 'botella de 1 litro', description: 'La misma receta en botella grande: para compartir en la mesa o tenerla lista en la refri.', sort: 1 },
];

// Si dos productos se llaman igual (la misma chicha en dos tamaños), se distinguen por el tamaño:
// "Chicha de maní · 1 litro".
export function productSize(p: Product, list: Product[]) {
  const same = list.some((x) => x.id !== p.id && x.name.trim().toLowerCase() === p.name.trim().toLowerCase());
  return same ? unitParts(p.unit || '').detail : '';
}
export function productLabel(p: Product, list: Product[]) {
  const size = productSize(p, list);
  return size ? `${p.name} · ${size}` : p.name;
}

export const PLACES = { portada: 'Botón de la portada', carta: 'Botón del producto', flotante: 'Botón flotante o de contacto' } as const;
export type Place = keyof typeof PLACES;

export function prodName(id: string | null | undefined, list: Product[] = PRODUCTS, markDeleted = false) {
  const p = list.find((x) => x.id === id);
  if (p) return productLabel(p, list);
  if (id === 'general') return 'Consulta general';
  if (id === 'otro') return 'Otro producto';
  if (!id) return 'Otro';
  // Producto que ya no está en la carta: su código pasado a nombre legible.
  const human = id.replace(/-+/g, ' ').replace(/^./, (c) => c.toUpperCase());
  return markDeleted ? `${human} (eliminado)` : human;
}

// S/ 5 · S/ 5.50
export function soles(n: number) {
  return 'S/ ' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
}

// "botella de 500 ml" → sustantivo "botella" (plural "botellas") y detalle "500 ml".
export function unitParts(unit: string) {
  const m = unit.trim().match(/^(\S+)(?:\s+de\s+(.+))?$/i);
  const noun = m ? m[1].toLowerCase() : 'unidad';
  const plural = /[aeiouáéó]$/.test(noun) ? noun + 's' : noun + 'es';
  return { noun, plural, detail: m && m[2] ? m[2] : '', fem: /a$/.test(noun) || noun === 'unidad' };
}
export function countLabel(unit: string, n: number) {
  const u = unitParts(unit || 'unidad');
  return `${n} ${n === 1 ? u.noun : u.plural}`;
}

export function waHref(productId: string) {
  const msg = isPresale()
    ? `Hola ${BUSINESS.name}, quiero separar un pedido en la preventa.`
    : `Hola ${BUSINESS.name}, quiero hacer una consulta.`;
  void productId;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// Mensaje con la cantidad elegida en la web.
export function orderText(p: Product, qty: number, presale: boolean) {
  const n = Math.max(1, Math.round(qty));
  const u = unitParts(p.unit || 'unidad');
  const what = `${countLabel(p.unit || 'unidad', n)} de ${p.name.toLowerCase()}`;
  const price = `${soles(p.price)} c/u = ${soles(p.price * n)}`;
  const detail = u.detail ? `(${u.detail}, ${price})` : `(${price})`;
  const pron = (u.fem ? 'la' : 'lo') + (n === 1 ? '' : 's');
  return presale
    ? `Hola ${BUSINESS.name}, quiero separar ${what} ${detail} para recibir${pron} desde ${LAUNCH.label}.`
    : `Hola ${BUSINESS.name}, quiero pedir ${what} ${detail}. ¿Para cuándo ${pron} tienen?`;
}

export function waOrderHref(p: Product, qty: number, presale: boolean) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText(p, qty, presale))}`;
}

// 51910897377 → +51 910 897 377
export function waDisplay(n = WHATSAPP_NUMBER) {
  const m = n.match(/^(51)(\d{3})(\d{3})(\d{3})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${n}`;
}
