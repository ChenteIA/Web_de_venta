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

export const PLACES = { portada: 'Botón de la portada', carta: 'Botón de la chicha', flotante: 'Botón flotante o de contacto' } as const;
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
  if (isPresale()) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      p
        ? `Hola ${BUSINESS.name}, quiero separar en preventa ${p.name.toLowerCase()} (${p.unit}, S/ ${p.price} c/u). Quiero ___ botellas para recibirlas desde ${LAUNCH.label}.`
        : `Hola ${BUSINESS.name}, quiero separar chicha de maní en la preventa.`,
    )}`;
  }
  const msg = p
    ? `Hola ${BUSINESS.name}, quiero pedir ${p.name.toLowerCase()} (${p.unit}, S/ ${p.price}${p.from ? ' en adelante' : ' c/u'}). Quiero ___ botellas para el día ___.`
    : `Hola ${BUSINESS.name}, quiero hacer una consulta sobre la chicha de maní.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// Mensaje con la cantidad elegida en la web (sección "La chicha").
export function orderText(productId: string, qty: number, presale: boolean) {
  const p = prod(productId);
  if (!p) return '';
  const n = Math.max(1, Math.round(qty));
  const what = n === 1 ? `1 botella de ${p.name.toLowerCase()}` : `${n} botellas de ${p.name.toLowerCase()}`;
  const detail = `(${p.unit.replace('botella de ', '')}, S/ ${p.price} c/u = S/ ${p.price * n})`;
  return presale
    ? `Hola ${BUSINESS.name}, quiero separar ${what} ${detail} para recibir${n === 1 ? 'la' : 'las'} desde ${LAUNCH.label}.`
    : `Hola ${BUSINESS.name}, quiero pedir ${what} ${detail}. ¿Para cuándo ${n === 1 ? 'la' : 'las'} tienen?`;
}

export function waOrderHref(productId: string, qty: number, presale: boolean) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText(productId, qty, presale))}`;
}

// 51910897377 → +51 910 897 377
export function waDisplay(n = WHATSAPP_NUMBER) {
  const m = n.match(/^(51)(\d{3})(\d{3})(\d{3})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${n}`;
}
