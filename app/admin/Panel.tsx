'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BUSINESS, PLACES, PRODUCTS, prodName, soles, type Place, type Product } from '@/lib/site';
import { normalize, PRODUCT_COLS, PRODUCTS_BUCKET, productPhoto } from '@/lib/products';
import Icon from '@/components/icons';
import { supabaseBrowser } from '@/lib/supabase/client';
import { REVIEWS_BUCKET } from '@/lib/supabase/config';
import { dayAdd, dayLong, dayShort, daysBetween, money, pct, timeOf, today } from '@/lib/time';

type Click = { id: string; product: string; place: Place; ts: string; day: string; hour: number; sold: boolean; demo: boolean };
type Sale = { id: string; product: string; qty: number; amount: number; day: string; click_id: string | null; ts: string; demo: boolean };
type Review = { id: string; image_path: string; customer: string | null; product: string | null; day: string; ts: string; visible: boolean; url?: string };
type Range = '1' | '7' | '30' | 'all';
type Tab = 'resumen' | 'ventas' | 'productos' | 'resenas';
const TABS: [Tab, string, 'chart' | 'bag' | 'box' | 'gallery'][] = [['resumen', 'Resumen', 'chart'], ['ventas', 'Ventas', 'bag'], ['productos', 'Productos', 'box'], ['resenas', 'Reseñas', 'gallery']];
type Draft = { id: string; isNew: boolean; name: string; price: string; unit: string; description: string; active: boolean; sort: string; photo_path: string | null };

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 a. m. a 10 p. m.
const PAGE = 1000;
const MAX_ROWS = 20000;

async function fetchAll<T>(table: string, cols: string): Promise<T[]> {
  const sb = supabaseBrowser();
  const out: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await sb.from(table).select(cols).order('ts', { ascending: false }).range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...((data || []) as T[]));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

function csv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((r) => r.map((v) => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(','))
    .join('\n');
}
function download(filename: string, text: string) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const slug = BUSINESS.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Reduce una imagen a WebP de máx. `max` px de ancho antes de subirla.
async function toWebp(file: File, max = 1080): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / bmp.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
    if (blob && blob.type === 'image/webp') return blob;
  } catch {}
  return file;
}

function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}
function topRound(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return '';
  r = Math.min(r, w / 2, h);
  return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
}

function Legend() {
  return (
    <div className="legend">
      <span><i style={{ background: 'var(--clicks)' }} />Clics a WhatsApp</span>
      <span><i style={{ background: 'var(--sales)' }} />Ventas registradas</span>
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string | number; delta?: React.ReactNode }) {
  return (
    <div className="kpi">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <span className="delta">{delta || ' '}</span>
    </div>
  );
}

export default function Panel() {
  const sb = supabaseBrowser();
  const [clicks, setClicks] = useState<Click[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prMissing, setPrMissing] = useState(false);
  const [tab, setTab] = useState<Tab>('resumen');
  const [loaded, setLoaded] = useState(false);
  const [range, setRange] = useState<Range>('7');
  const [status, setStatus] = useState('');
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState('');

  const load = useCallback(async () => {
    try {
      const [c, s, r, pr] = await Promise.all([
        fetchAll<Click>('clicks', 'id, product, place, ts, day, hour, sold, demo'),
        fetchAll<Sale>('sales', 'id, product, qty, amount, day, click_id, ts, demo'),
        fetchAll<Review>('reviews', 'id, image_path, customer, product, day, ts, visible'),
        sb.from('products').select(PRODUCT_COLS).order('sort').order('name'),
      ]);
      // Si la tabla de productos aún no existe (esquema sin actualizar), se usa la lista del código.
      setProducts(pr.error ? PRODUCTS : normalize(pr.data || []));
      setPrMissing(Boolean(pr.error));
      setClicks(c);
      setSales(s.map((x) => ({ ...x, amount: Number(x.amount) })));
      if (r.length) {
        const { data } = await sb.storage.from(REVIEWS_BUCKET).createSignedUrls(r.map((x) => x.image_path), 3600);
        const urls = new Map((data || []).map((d) => [d.path, d.signedUrl]));
        setReviews(r.map((x) => ({ ...x, url: urls.get(x.image_path) || undefined })));
      } else setReviews([]);
      setLoaded(true);
      setLoadError('');
    } catch {
      setLoadError('No se pudieron cargar los datos. Revisa tu conexión y toca "Actualizar".');
    }
  }, [sb]);

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (TABS.some(([k]) => k === h)) setTab(h as Tab);
  }, []);
  function goTab(k: Tab) {
    setTab(k);
    try { history.replaceState(null, '', '#' + k); } catch {}
  }

  useEffect(() => {
    load();
    const onFocus = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [load]);

  /* ---------- Periodo ---------- */
  const t = today();
  const n = range === 'all' ? null : Number(range);
  const win = (offset: number) => {
    if (!n) return { from: '0000-00-00', to: '9999-99-99' };
    const to = dayAdd(t, -n * offset);
    return { from: dayAdd(to, -(n - 1)), to };
  };
  const w = win(0), pw = win(1);
  const inW = (d: string, x: { from: string; to: string }) => d >= x.from && d <= x.to;
  const pClicks = clicks.filter((c) => inW(c.day, w));
  const pSales = sales.filter((s) => inW(s.day, w));
  const prevClicks = clicks.filter((c) => inW(c.day, pw)).length;
  const prevSalesL = sales.filter((s) => inW(s.day, pw));
  const amount = pSales.reduce((a, s) => a + s.amount, 0);
  const prevAmount = prevSalesL.reduce((a, s) => a + s.amount, 0);
  const prevTicket = prevSalesL.length ? prevAmount / prevSalesL.length : 0;
  const ticket = pSales.length ? amount / pSales.length : 0;
  const conv = pClicks.length ? pSales.length / pClicks.length : 0;
  const prevConv = prevClicks ? prevSalesL.length / prevClicks : 0;
  const clickById = useMemo(() => new Map(clicks.map((c) => [c.id, c])), [clicks]);
  const pn = (id: string | null | undefined) => prodName(id, products, !prMissing);
  const findP = (id: string | null | undefined) => products.find((p) => p.id === id) || null;
  const units = pSales.reduce((a, s) => a + s.qty, 0);
  const prevUnits = prevSalesL.reduce((a, s) => a + s.qty, 0);

  function delta(cur: number, prev: number): React.ReactNode {
    if (!n) return '';
    const lbl = range === '1' ? 'frente a ayer' : `frente a los ${range} días anteriores`;
    if (!prev && !cur) return 'Sin datos aún';
    if (!prev) return <><b>Nuevo</b> frente a {range === '1' ? 'ayer' : 'el periodo anterior'}</>;
    const d = Math.round(((cur - prev) / prev) * 100);
    return <><b>{d > 0 ? '+' : ''}{d} %</b> {lbl}</>;
  }

  /* ---------- Formulario de venta ---------- */
  const [fProduct, setFProduct] = useState('');
  const [fQty, setFQty] = useState(1);
  const [fAmount, setFAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [fDay, setFDay] = useState(t);
  const [fClick, setFClick] = useState<string | null>(null);
  const [saleStatus, setSaleStatus] = useState('');
  const saleCard = useRef<HTMLDivElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  // Al cargar los productos, el formulario empieza con el primero visible.
  useEffect(() => {
    if (!products.length || products.some((p) => p.id === fProduct) || fProduct === 'otro') return;
    const first = products.find((p) => p.active !== false) || products[0];
    setFProduct(first.id);
    if (!amountTouched) setFAmount(String(first.price * Math.max(1, fQty || 1)));
  }, [products, fProduct, fQty, amountTouched]);

  function autoAmount(product: string, qty: number, touched = amountTouched) {
    if (touched) return;
    const p = findP(product);
    setFAmount(p ? String(p.price * Math.max(1, qty || 1)) : '');
  }
  function linkClick(id: string) {
    const c = clickById.get(id);
    if (!c) return;
    setFClick(c.id);
    const product = findP(c.product) ? c.product : fProduct;
    setFProduct(product);
    setFDay(c.day);
    setFQty(1);
    setAmountTouched(false);
    autoAmount(product, 1, false);
    saleCard.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    qtyRef.current?.focus({ preventScroll: true });
  }
  async function saveSale(e: React.FormEvent) {
    e.preventDefault();
    const row = {
      product: fProduct,
      qty: Math.max(1, Math.floor(fQty) || 1),
      amount: Math.max(0, Number(fAmount) || 0),
      day: fDay || t,
      click_id: fClick,
    };
    setSaleStatus('Guardando…');
    const { error } = await sb.from('sales').insert(row);
    if (error) {
      setSaleStatus(error.code === '23505' ? 'Ese clic ya tiene una venta registrada.' : 'No se pudo guardar la venta. Revisa tu conexión e inténtalo otra vez.');
      return;
    }
    setSaleStatus(`Venta guardada: ${pn(row.product)}, ${money(row.amount)}.`);
    setFQty(1);
    setFClick(null);
    setAmountTouched(false);
    autoAmount(fProduct, 1, false);
    load();
  }
  async function deleteSale(id: string) {
    setConfirm('');
    const { error } = await sb.from('sales').delete().eq('id', id);
    if (error) setStatus('No se pudo eliminar la venta. Inténtalo otra vez.');
    load();
  }

  /* ---------- Datos de ejemplo ---------- */
  const demoC = clicks.filter((c) => c.demo).length;
  const demoS = sales.filter((s) => s.demo).length;

  async function generateDemo() {
    setBusy('demo');
    setStatus('Generando datos de ejemplo…');
    const catalog = products.filter((p) => p.active !== false).length ? products.filter((p) => p.active !== false) : PRODUCTS;
    const weights = catalog.map(() => 1);
    const pick = <T,>(arr: T[], ws: number[]) => { let r = Math.random() * ws.reduce((a, b) => a + b, 0); for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; } return arr[arr.length - 1]; };
    const nowHour = new Date(Date.now() - 5 * 3600e3).getUTCHours();
    const rows: { product: string; place: Place; ts: string; demo: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = dayAdd(t, -i);
      const wd = new Date(day + 'T12:00:00Z').getUTCDay();
      const count = Math.round((wd === 0 || wd === 6 ? 9 : 5) + Math.random() * 6);
      for (let k = 0; k < count; k++) {
        let hour = pick(HOURS, [1, 2, 3, 3, 4, 5, 4, 3, 3, 3, 4, 6, 7, 6, 4, 2]);
        if (i === 0 && hour > nowHour) continue;
        const min = Math.floor(Math.random() * 60);
        const place = pick<Place>(['portada', 'carta', 'flotante'], [2, 6, 3]);
        const product = place === 'carta' ? pick(catalog.map((p) => p.id), weights) : Math.random() < 0.6 ? 'general' : pick(catalog.map((p) => p.id), weights);
        rows.push({ product, place, ts: `${day}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00-05:00`, demo: true });
      }
    }
    const { data, error } = await sb.from('clicks').insert(rows).select('id, product, day');
    if (error || !data) { setBusy(''); setStatus('No se pudieron generar los datos de ejemplo.'); return; }
    const saleRows = data
      .filter(() => Math.random() < 0.32)
      .map((c) => {
        const p = catalog.find((x) => x.id === c.product) || pick(catalog, weights);
        const qty = Math.random() < 0.8 ? 1 : 2;
        return { product: p.id, qty, amount: p.price * qty, day: c.day, click_id: c.id, demo: true };
      });
    const direct = Array.from({ length: 6 }, () => {
      const p = pick(catalog, weights);
      return { product: p.id, qty: 1, amount: p.price, day: dayAdd(t, -Math.floor(Math.random() * 30)), click_id: null, demo: true };
    });
    const { error: e2 } = await sb.from('sales').insert([...saleRows, ...direct]);
    setBusy('');
    setStatus(e2 ? 'Se crearon los clics de ejemplo, pero no las ventas.' : `Listo: ${rows.length} clics y ${saleRows.length + direct.length} ventas de ejemplo.`);
    load();
  }
  async function clearDemo() {
    setConfirm('');
    setBusy('demo');
    setStatus('Borrando datos de ejemplo…');
    const a = await sb.from('sales').delete().eq('demo', true);
    const b = await sb.from('clicks').delete().eq('demo', true);
    setBusy('');
    setStatus(a.error || b.error ? 'No se pudieron borrar todos los datos de ejemplo.' : 'Datos de ejemplo borrados.');
    load();
  }

  /* ---------- Exportar ---------- */
  function exportSales() {
    const rows = [['fecha', 'producto', 'cantidad', 'monto_soles', 'origen', 'ejemplo'], ...sales.map((s) => [s.day, pn(s.product), s.qty, s.amount.toFixed(2), s.click_id ? 'clic' : 'directa', s.demo ? 'si' : 'no'])];
    download(`ventas-${slug}.csv`, csv(rows));
  }
  function exportClicks() {
    const rows = [['fecha', 'hora', 'producto', 'boton', 'venta_registrada', 'ejemplo'], ...clicks.map((c) => [c.day, timeOf(c.ts), pn(c.product), PLACES[c.place] || c.place, c.sold ? 'si' : 'no', c.demo ? 'si' : 'no'])];
    download(`clics-whatsapp-${slug}.csv`, csv(rows));
  }

  /* ---------- Reseñas ---------- */
  const [rvStatus, setRvStatus] = useState('');
  const rvForm = useRef<HTMLFormElement>(null);
  async function uploadReviews(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const files = (f.getAll('files') as File[]).filter((x) => x && x.size);
    if (!files.length) return;
    const customer = String(f.get('customer') || '').trim().slice(0, 40) || null;
    const product = String(f.get('product') || 'general');
    let done = 0, failed = 0;
    setBusy('rv');
    for (let i = 0; i < files.length; i++) {
      setRvStatus(`Subiendo ${i + 1} de ${files.length}…`);
      try {
        const blob = await toWebp(files[i]);
        const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from(REVIEWS_BUCKET).upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
        if (up.error) throw up.error;
        const ins = await sb.from('reviews').insert({ image_path: path, customer, product, day: t, visible: true });
        if (ins.error) { await sb.storage.from(REVIEWS_BUCKET).remove([path]); throw ins.error; }
        done++;
      } catch {
        failed++;
      }
    }
    setBusy('');
    setRvStatus(done
      ? (done === 1 ? 'Captura publicada en la web.' : `${done} capturas publicadas en la web.`) + (failed ? ` ${failed} no se pudieron subir (usa PNG, JPG o WEBP de menos de 5 MB).` : '')
      : 'No se pudo subir. Usa imágenes PNG, JPG o WEBP de menos de 5 MB.');
    if (done) rvForm.current?.reset();
    load();
  }
  async function toggleReview(r: Review) {
    await sb.from('reviews').update({ visible: !r.visible }).eq('id', r.id);
    load();
  }
  async function deleteReview(r: Review) {
    setConfirm('');
    const { error } = await sb.from('reviews').delete().eq('id', r.id);
    if (!error) await sb.storage.from(REVIEWS_BUCKET).remove([r.image_path]);
    load();
  }

  /* ---------- Productos ---------- */
  const [draft, setDraft] = useState<Draft | null>(null);
  const [prStatus, setPrStatus] = useState('');
  const photoInput = useRef<HTMLInputElement>(null);
  const draftBox = useRef<HTMLDivElement>(null);

  function startEdit(p: Product | null) {
    setPrStatus('');
    setDraft(p
      ? { id: p.id, isNew: false, name: p.name, price: String(p.price), unit: p.unit, description: p.description, active: p.active !== false, sort: String(p.sort ?? 0), photo_path: p.photo_path ?? null }
      : { id: '', isNew: true, name: '', price: '', unit: '', description: '', active: true, sort: String(products.reduce((m, x) => Math.max(m, x.sort ?? 0), 0) + 1), photo_path: null });
    requestAnimationFrame(() => draftBox.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  // Foto que se verá: la subida (si sigue) o, si no hay, la de la web para ese código.
  const draftPhoto = draft ? productPhoto({ id: draft.id, name: draft.name, price: 0, unit: '', description: '', photo_path: draft.photo_path }) : null;

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const price = Math.round(Number(draft.price) * 100) / 100;
    if (!name) { setPrStatus('Escribe el nombre del producto.'); return; }
    if (!(price > 0)) { setPrStatus('Escribe un precio mayor que cero, por ejemplo 5 o 5.50.'); return; }
    let id = draft.id;
    if (draft.isNew) {
      const base = slugify(name) || 'producto';
      id = base === 'general' || base === 'otro' ? base + '-1' : base;
      for (let k = 2; products.some((p) => p.id === id); k++) id = `${base.slice(0, 36)}-${k}`;
    }
    const before = findP(id);
    setBusy('pr');
    setPrStatus('Guardando…');
    let photo_path = draft.photo_path;
    let uploaded: string | null = null;
    const file = photoInput.current?.files?.[0];
    if (file) {
      try {
        const blob = await toWebp(file, 1400);
        const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
        const path = `${id}/${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from(PRODUCTS_BUCKET).upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
        if (up.error) throw up.error;
        uploaded = path;
        photo_path = path;
      } catch {
        setBusy('');
        setPrStatus('No se pudo subir la foto. Usa una imagen PNG, JPG o WEBP de menos de 5 MB.');
        return;
      }
    }
    const row = { name: name.slice(0, 60), price, unit: draft.unit.trim().slice(0, 40), description: draft.description.trim().slice(0, 240), active: draft.active, sort: Math.round(Number(draft.sort) || 0), photo_path };
    const res = draft.isNew ? await sb.from('products').insert({ id, ...row }) : await sb.from('products').update(row).eq('id', id);
    if (res.error) {
      if (uploaded) await sb.storage.from(PRODUCTS_BUCKET).remove([uploaded]);
      setBusy('');
      setPrStatus('No se pudo guardar. Revisa los datos y tu conexión, e inténtalo otra vez.');
      return;
    }
    // La foto anterior ya no se usa: se borra del almacenamiento.
    if (before?.photo_path && before.photo_path !== photo_path) await sb.storage.from(PRODUCTS_BUCKET).remove([before.photo_path]);
    setBusy('');
    setDraft(null);
    if (photoInput.current) photoInput.current.value = '';
    setPrStatus(`${draft.isNew ? 'Producto agregado' : 'Cambios guardados'}: ${row.name}, ${soles(row.price)}. ${row.active ? 'Ya se ve así en la web.' : 'Está oculto: no aparece en la web.'}`);
    load();
  }
  async function toggleProduct(p: Product) {
    const { error } = await sb.from('products').update({ active: p.active === false }).eq('id', p.id);
    setPrStatus(error ? 'No se pudo cambiar. Inténtalo otra vez.' : p.active === false ? `${p.name} vuelve a aparecer en la web.` : `${p.name} ya no aparece en la web.`);
    load();
  }
  async function deleteProduct(p: Product) {
    setConfirm('');
    const { error } = await sb.from('products').delete().eq('id', p.id);
    if (!error && p.photo_path) await sb.storage.from(PRODUCTS_BUCKET).remove([p.photo_path]);
    setPrStatus(error ? 'No se pudo eliminar. Inténtalo otra vez.' : `Producto eliminado: ${p.name}. Sus ventas y clics pasados se conservan.`);
    if (draft?.id === p.id) setDraft(null);
    load();
  }

  /* ---------- Gráfico por día ---------- */
  const chartBox = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(640);
  const [tip, setTip] = useState<{ i: number } | null>(null);
  const [showTable, setShowTable] = useState(false);
  useEffect(() => {
    const el = chartBox.current;
    if (!el || !window.ResizeObserver) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth || 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, [loaded, showTable, tab]);

  const days = useMemo(() => {
    let count = 7;
    if (range === '30') count = 30;
    else if (range === 'all') {
      let min = t;
      for (const x of [...clicks, ...sales]) if (x.day && x.day < min) min = x.day;
      count = Math.min(90, Math.max(7, daysBetween(min, t) + 1));
    }
    return Array.from({ length: count }, (_, i) => dayAdd(t, -(count - 1 - i)));
  }, [range, clicks, sales, t]);

  const chartData = useMemo(() => {
    const cBy: Record<string, number> = {}, sBy: Record<string, number> = {}, mBy: Record<string, number> = {};
    clicks.forEach((c) => { cBy[c.day] = (cBy[c.day] || 0) + 1; });
    sales.forEach((s) => { sBy[s.day] = (sBy[s.day] || 0) + 1; mBy[s.day] = (mBy[s.day] || 0) + s.amount; });
    return days.map((d) => ({ day: d, c: cBy[d] || 0, s: sBy[d] || 0, m: mBy[d] || 0 }));
  }, [days, clicks, sales]);

  function renderChart() {
    const W = Math.max(280, cw), H = 230, pl = 34, pr = 6, pt = 10, pb = 28;
    const max = niceMax(Math.max(1, ...chartData.map((d) => Math.max(d.c, d.s))));
    const iw = W - pl - pr, ih = H - pt - pb, slot = iw / chartData.length;
    const bw = Math.max(2, Math.min(16, (slot - 6) / 2));
    const y = (v: number) => pt + ih - (v / max) * ih;
    const every = Math.ceil(chartData.length / (W < 500 ? 5 : 9));
    const td = tip ? chartData[tip.i] : null;
    return (
      <>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Clics y ventas por día" onMouseLeave={() => setTip(null)}>
          {[0, max / 2, max].map((v) => (
            <g key={v}>
              <line className="grid" x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} />
              <text x={pl - 8} y={y(v) + 4} textAnchor="end">{v}</text>
            </g>
          ))}
          {chartData.map((d, i) => {
            const x0 = pl + i * slot + (slot - (bw * 2 + 2)) / 2;
            return (
              <g key={d.day}>
                <rect className="hit" x={pl + i * slot} y={pt} width={slot} height={ih} rx={4} onMouseEnter={() => setTip({ i })} onClick={() => setTip({ i })} />
                <path d={topRound(x0, y(d.c), bw, ih + pt - y(d.c), 4)} style={{ fill: 'var(--clicks)', pointerEvents: 'none' }} />
                <path d={topRound(x0 + bw + 2, y(d.s), bw, ih + pt - y(d.s), 4)} style={{ fill: 'var(--sales)', pointerEvents: 'none' }} />
                {(chartData.length - 1 - i) % every === 0 && <text x={pl + i * slot + slot / 2} y={H - 8} textAnchor="middle">{dayShort(d.day)}</text>}
              </g>
            );
          })}
          <line x1={pl} x2={W - pr} y1={pt + ih} y2={pt + ih} style={{ stroke: 'var(--muted)', strokeWidth: 1 }} />
        </svg>
        {td && tip && (
          <div className="tip" style={{ left: Math.min(Math.max(pl + tip.i * slot + slot / 2, 70), W - 70), top: y(Math.max(td.c, td.s)) }}>
            <b>{dayLong(td.day)}</b><br />{td.c}{td.c === 1 ? ' clic' : ' clics'}, {td.s}{td.s === 1 ? ' venta' : ' ventas'}
          </div>
        )}
      </>
    );
  }

  /* ---------- Desgloses ---------- */
  const byProduct = useMemo(() => {
    const rows: Record<string, { id: string; c: number; s: number; u: number; m: number }> = {};
    const row = (id: string) => rows[id] || (rows[id] = { id, c: 0, s: 0, u: 0, m: 0 });
    pClicks.forEach((c) => { row(c.product).c++; });
    pSales.forEach((s) => { const r = row(s.product); r.s++; r.u += s.qty; r.m += s.amount; });
    return Object.values(rows).sort((a, b) => b.m - a.m || b.c - a.c);
  }, [pClicks, pSales]);
  const prodMax = Math.max(1, ...byProduct.map((r) => Math.max(r.c, r.s)));

  // Ventas por botón y por hora: se atribuyen al clic vinculado.
  const linked = pSales.map((s) => (s.click_id ? clickById.get(s.click_id) : undefined)).filter(Boolean) as Click[];
  const placeC: Record<string, number> = {}, placeS: Record<string, number> = {};
  pClicks.forEach((c) => { placeC[c.place] = (placeC[c.place] || 0) + 1; });
  linked.forEach((c) => { placeS[c.place] = (placeS[c.place] || 0) + 1; });
  const placeMax = Math.max(1, ...Object.keys(PLACES).map((k) => Math.max(placeC[k] || 0, placeS[k] || 0)));
  const hourC: Record<number, number> = {}, hourS: Record<number, number> = {};
  pClicks.forEach((c) => { hourC[c.hour] = (hourC[c.hour] || 0) + 1; });
  linked.forEach((c) => { hourS[c.hour] = (hourS[c.hour] || 0) + 1; });
  const hourMax = Math.max(1, ...HOURS.map((h) => Math.max(hourC[h] || 0, hourS[h] || 0)));

  const salesList = [...pSales].sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : b.ts.localeCompare(a.ts))).slice(0, 50);

  return (
    <main className="wrap panel">
      <div className="panel-head">
        <div>
          <h1>Panel del negocio</h1>
          <p>Cuántas personas tocaron el botón de WhatsApp y cuántas terminaron comprando.</p>
        </div>
      </div>

      <nav className="tabs" aria-label="Secciones del panel">
        {TABS.map(([k, l, ic]) => (
          <button key={k} type="button" aria-current={tab === k ? 'page' : undefined} onClick={() => goTab(k)}><Icon name={ic} />{l}</button>
        ))}
      </nav>

      <div className="toolbar">
        {(tab === 'resumen' || tab === 'ventas') && <div className="seg" role="group" aria-label="Periodo">
          {([['1', 'Hoy'], ['7', '7 días'], ['30', '30 días'], ['all', 'Todo']] as [Range, string][]).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={range === v} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>}
        <span className="spacer" />
        <button type="button" className="btn btn-sm btn-ghost" onClick={load} aria-label="Actualizar datos"><Icon name="refresh" /><span className="vt-label">Actualizar</span></button>
      </div>

      {(tab === 'resumen' || tab === 'ventas') && (demoC > 0 || demoS > 0) && (
        <div className="notice">
          <span><span className="tag demo">Ejemplo</span> Estás viendo {demoC} clics y {demoS} ventas de ejemplo. Bórralos antes de usar el panel con un negocio real.</span>
          <span>
            {confirm === 'demo' ? (
              <span className="confirm">¿Borrar todos los datos de ejemplo? <button type="button" className="btn btn-sm btn-danger" onClick={clearDemo}>Sí, borrar</button><button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm('')}>Cancelar</button></span>
            ) : (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm('demo')} disabled={busy === 'demo'}>Borrar datos de ejemplo</button>
            )}
          </span>
        </div>
      )}
      <p className="status" role="status">{loadError || status}</p>

      {tab === 'resumen' && <>
      <div className="kpis">
        {!loaded ? (
          <div className="kpi"><span className="label">Cargando datos…</span><span className="value">&nbsp;</span></div>
        ) : (
          <>
            <Kpi label="Clics a WhatsApp" value={pClicks.length} delta={delta(pClicks.length, prevClicks)} />
            <Kpi label="Ventas registradas" value={pSales.length} delta={delta(pSales.length, prevSalesL.length)} />
            <Kpi label="Unidades vendidas" value={units} delta={delta(units, prevUnits)} />
            <Kpi label="Monto vendido" value={soles(Math.round(amount * 100) / 100)} delta={delta(amount, prevAmount)} />
            <Kpi label="Conversión" value={pct(pSales.length, pClicks.length)} delta={n ? delta(conv, prevConv) : 'Ventas por cada 100 clics'} />
            <Kpi label="Ticket promedio" value={pSales.length ? soles(Math.round(ticket * 100) / 100) : '—'} delta={n ? delta(ticket, prevTicket) : 'Monto por venta'} />
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div><h2>Clics y ventas por día</h2><p className="sub">{range === '1' ? 'Últimos 7 días, para comparar hoy con la semana.' : `${days.length} días, del ${dayShort(days[0])} al ${dayShort(days[days.length - 1])}.`}</p></div>
          <div className="chart-tools"><Legend /><button type="button" className="linkbtn" aria-pressed={showTable} onClick={() => setShowTable(!showTable)}>{showTable ? 'Ver gráfico' : 'Ver como tabla'}</button></div>
        </div>
        {showTable ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Día</th><th className="r">Clics</th><th className="r">Ventas</th><th className="r">Monto</th></tr></thead>
              <tbody>
                {[...chartData].reverse().map((d) => (
                  <tr key={d.day}><td>{dayLong(d.day)}</td><td className="r">{d.c}</td><td className="r">{d.s}</td><td className="r">{money(d.m)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart" ref={chartBox}>{renderChart()}</div>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-head"><div><h2>Por producto</h2><p className="sub">Qué piden más y cuánto se convierte en venta.</p></div><Legend /></div>
          {byProduct.length ? (
            <>
              <div className="bars-h" style={{ marginBottom: 18 }}>
                {byProduct.map((r) => (
                  <div className="row" key={r.id}>
                    <span>{pn(r.id)}</span>
                    <span className="num">{r.c} {r.c === 1 ? 'clic' : 'clics'} · {r.s} {r.s === 1 ? 'venta' : 'ventas'}</span>
                    <div className="track thin"><div className="fill" style={{ width: `${(r.c / prodMax) * 100}%` }} /></div>
                    <div className="track thin"><div className="fill s" style={{ width: `${(r.s / prodMax) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="table-wrap">
                <table id="by-product">
                  <thead><tr><th>Producto</th><th className="r">Clics</th><th className="r">Ventas</th><th className="r">Unid.</th><th className="r">Monto</th><th className="r">Conv.</th></tr></thead>
                  <tbody>
                    {byProduct.map((r) => (
                      <tr key={r.id}><td>{pn(r.id)}</td><td className="r">{r.c}</td><td className="r">{r.s}</td><td className="r">{r.u}</td><td className="r">{money(r.m)}</td><td className="r">{r.id === 'general' || !r.c ? '—' : pct(r.s, r.c)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="sub">Aún no hay clics ni ventas en este periodo.</p>
          )}
        </div>
        <div className="stack">
          <div className="card">
            <div className="card-head"><div><h2>Qué botón tocan</h2><p className="sub">Dónde estaba la persona cuando decidió escribir. Ventas: las registradas desde un clic.</p></div></div>
            <div className="bars-h">
              {(Object.keys(PLACES) as Place[]).map((k) => {
                const c = placeC[k] || 0, s = placeS[k] || 0;
                return (
                  <div className="row" key={k}>
                    <span>{PLACES[k]}</span>
                    <span className="num">{c} ({pct(c, pClicks.length)}) · {s} {s === 1 ? 'venta' : 'ventas'}</span>
                    <div className="track thin"><div className="fill" style={{ width: `${(c / placeMax) * 100}%` }} /></div>
                    <div className="track thin"><div className="fill s" style={{ width: `${(s / placeMax) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div><h2>A qué hora escriben</h2><p className="sub">Clics y ventas por hora del día, de 7 a. m. a 10 p. m. (hora de Lima).</p></div><Legend /></div>
            <div className="hours duo" role="img" aria-label={'Clics por hora: ' + HOURS.map((h) => `${h}h ${hourC[h] || 0}`).join(', ')}>
              {HOURS.map((h) => (
                <div key={h} title={`${h}:00, ${hourC[h] || 0} clics, ${hourS[h] || 0} ventas`}>
                  <i style={{ height: `${((hourC[h] || 0) / hourMax) * 100}%` }} />
                  <i style={{ height: `${((hourS[h] || 0) / hourMax) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="hours-x">{HOURS.map((h) => <span key={h}>{h % 3 === 1 ? (h > 12 ? `${h - 12}p` : h + (h === 12 ? 'p' : 'a')) : ''}</span>)}</div>
          </div>
        </div>
      </div>

      <div className="demo-tools">
        <button type="button" className="btn btn-sm btn-ghost" onClick={generateDemo} disabled={busy === 'demo'}><Icon name="stars2" />Generar datos de ejemplo</button>
        <span className="hint">Para probar el panel antes de tener ventas reales. Se borran con un botón.</span>
      </div>
      </>}

      {tab === 'ventas' && <>
      <div className="grid2">
        <div className="card" ref={saleCard}>
          <div className="card-head"><div><h2>Registrar una venta</h2><p className="sub">
            {fClick && clickById.get(fClick)
              ? `Vinculada al clic del ${dayShort(clickById.get(fClick)!.day)}, ${timeOf(clickById.get(fClick)!.ts)} (${pn(clickById.get(fClick)!.product)}).`
              : 'Cuando un pedido por WhatsApp se concreta, anótalo aquí. También sirve para ventas directas.'}
          </p></div></div>
          <form className="f" onSubmit={saveSale} autoComplete="off">
            <label className="field wide">Producto
              <select value={fProduct} onChange={(e) => { setFProduct(e.target.value); autoAmount(e.target.value, fQty); }}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({soles(p.price)}){p.active === false ? ' · oculto' : ''}</option>)}
                <option value="otro">Otro producto</option>
              </select>
            </label>
            <label className="field">Cantidad<input ref={qtyRef} type="number" inputMode="numeric" min={1} step={1} value={fQty} required onChange={(e) => { const q = Number(e.target.value); setFQty(q); autoAmount(fProduct, q); }} /></label>
            <label className="field">Monto (S/)<input type="number" inputMode="decimal" min={0} step="0.5" value={fAmount} required onChange={(e) => { setFAmount(e.target.value); setAmountTouched(true); }} /></label>
            <label className="field">Fecha<input type="date" value={fDay} max={t} required onChange={(e) => setFDay(e.target.value)} /></label>
            <div className="field wide" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn btn-dark btn-sm">Guardar venta</button>
              {fClick && <button type="button" className="linkbtn" onClick={() => setFClick(null)}>Quitar el clic vinculado</button>}
              <span className="status" role="status">{saleStatus}</span>
            </div>
          </form>
        </div>
        <div className="card">
          <div className="card-head"><div><h2>Últimos clics</h2><p className="sub">Si ese cliente compró, regístralo con un toque.</p></div></div>
          <div className="list">
            {!clicks.length ? (
              <p className="sub" style={{ padding: '12px 0' }}>Todavía nadie tocó el botón. Comparte la web y aquí verás cada clic.</p>
            ) : (
              clicks.slice(0, 8).map((c) => (
                <div className="li" key={c.id}>
                  <div>
                    <div>{pn(c.product)}{c.demo && <> <span className="tag demo">Ejemplo</span></>}</div>
                    <div className="meta">{dayShort(c.day)}, {timeOf(c.ts)}, {(PLACES[c.place] || c.place).toLowerCase()}</div>
                  </div>
                  {c.sold ? <span className="tag ok">Venta registrada</span> : <button type="button" className="btn btn-sm btn-ghost" onClick={() => linkClick(c.id)}>Registrar venta</button>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div><h2>Ventas registradas</h2><p className="sub">{pSales.length ? `${pSales.length} ${pSales.length === 1 ? 'venta' : 'ventas'} en el periodo, por ${money(amount)}.${pSales.length > 50 ? ' Se muestran las 50 más recientes.' : ''}` : 'No hay ventas en este periodo.'}</p></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportSales} disabled={!sales.length}><Icon name="download2" />Descargar ventas (CSV)</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportClicks} disabled={!clicks.length}><Icon name="download2" />Descargar clics (CSV)</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            {salesList.length ? (
              <>
                <thead><tr><th>Fecha</th><th>Producto</th><th className="r">Cant.</th><th className="r">Monto</th><th>Origen</th><th></th></tr></thead>
                <tbody>
                  {salesList.map((s) => (
                    <tr key={s.id}>
                      <td>{dayShort(s.day)}</td>
                      <td>{pn(s.product)}{s.demo && <> <span className="tag demo">Ejemplo</span></>}</td>
                      <td className="r">{s.qty}</td>
                      <td className="r">{money(s.amount)}</td>
                      <td>{s.click_id ? 'Desde un clic' : 'Venta directa'}</td>
                      <td className="r">
                        {confirm === 'sale:' + s.id ? (
                          <span className="confirm">¿Eliminar? <button type="button" className="linkbtn" onClick={() => deleteSale(s.id)}>Sí</button><button type="button" className="linkbtn" onClick={() => setConfirm('')}>No</button></span>
                        ) : (
                          <button type="button" className="linkbtn" onClick={() => setConfirm('sale:' + s.id)}>Eliminar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <tbody><tr><td>Registra tu primera venta con el formulario de arriba.</td></tr></tbody>
            )}
          </table>
        </div>
      </div>

      </>}

      {tab === 'productos' && (
      <div className="card">
        <div className="card-head">
          <div><h2>Productos</h2><p className="sub">Lo que ves aquí es lo que aparece en la web. Los cambios de precio, foto o texto se ven al instante.</p></div>
          {!draft && <button type="button" className="btn btn-sm btn-dark" onClick={() => startEdit(null)} disabled={prMissing}><Icon name="add-circle" />Agregar producto</button>}
        </div>
        {prMissing && <div className="notice">Para editar productos desde aquí, vuelve a ejecutar <b>supabase/schema.sql</b> en el SQL Editor de Supabase (agrega la tabla de productos). Mientras tanto la web usa la lista del código.</div>}
        <p className="status" role="status">{prStatus}</p>
        <div ref={draftBox}>
          {draft && (
            <form className="f pr-form" onSubmit={saveProduct} autoComplete="off">
              <h3 className="field wide pr-title">{draft.isNew ? 'Nuevo producto' : `Editar: ${findP(draft.id)?.name || draft.name}`}</h3>
              <label className="field wide">Nombre<input id="pr-name" value={draft.name} maxLength={60} required placeholder="Ej.: Chicha morada" onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
              <label className="field">Precio (S/)<input id="pr-price" type="number" inputMode="decimal" min={0.1} step="0.1" value={draft.price} required placeholder="5" onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></label>
              <label className="field">Presentación<input id="pr-unit" value={draft.unit} maxLength={40} placeholder="botella de 500 ml" onChange={(e) => setDraft({ ...draft, unit: e.target.value })} /><span className="hint">Va en el mensaje: &quot;3 botellas de…&quot;</span></label>
              <label className="field wide">Descripción<textarea id="pr-desc" value={draft.description} maxLength={240} rows={3} placeholder="Cómo es, con qué se prepara, cómo se toma." onChange={(e) => setDraft({ ...draft, description: e.target.value })} /><span className="hint">{draft.description.length} de 240 caracteres</span></label>
              <div className="field wide">Foto
                <div className="pr-photo">
                  {draftPhoto ? <img src={draftPhoto.src} alt="Foto actual" /> : <span className="pr-nophoto">Sin foto</span>}
                  <div className="pr-photo-actions">
                    <input id="pr-file" ref={photoInput} type="file" accept="image/png,image/jpeg,image/webp" />
                    <span className="hint">Horizontal o cuadrada. Se ajusta sola a 1400 px.{draft.photo_path ? '' : ' Si no subes una, se usa la foto de la web (si existe).'}</span>
                    {draft.photo_path && <button type="button" className="linkbtn" onClick={() => setDraft({ ...draft, photo_path: null })}>Quitar la foto subida</button>}
                  </div>
                </div>
              </div>
              <label className="field">Orden<input id="pr-sort" type="number" inputMode="numeric" step={1} value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value })} /><span className="hint">Los números menores aparecen primero.</span></label>
              <label className="field pr-check"><input id="pr-active" type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />Visible en la web</label>
              <div className="field wide" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <button type="submit" className="btn btn-dark btn-sm" disabled={busy === 'pr'}>{draft.isNew ? 'Agregar producto' : 'Guardar cambios'}</button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setDraft(null); setPrStatus(''); }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
        <div className="pr-list">
          {!products.length ? (
            <p className="sub">Aún no hay productos. Agrega el primero.</p>
          ) : (
            products.map((p) => {
              const ph = productPhoto(p);
              return (
                <div className={'pr-row' + (p.active === false ? ' off' : '')} key={p.id}>
                  <div className="pr-thumb">{ph ? <img src={ph.src} alt="" loading="lazy" /> : <span>Sin foto</span>}</div>
                  <div className="pr-info">
                    <b>{p.name}</b>
                    <span className="num">{soles(p.price)}{p.unit ? ` · ${p.unit}` : ''}</span>
                    {p.active === false && <span className="tag">Oculto en la web</span>}
                  </div>
                  <div className="acts">
                    {confirm === 'pr:' + p.id ? (
                      <span className="confirm">¿Eliminar {p.name}? <button type="button" onClick={() => deleteProduct(p)}>Sí, eliminar</button><button type="button" onClick={() => setConfirm('')}>No</button></span>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(p)} disabled={prMissing}><Icon name="pen" />Editar</button>
                        <button type="button" onClick={() => toggleProduct(p)} disabled={prMissing}><Icon name={p.active === false ? 'eye' : 'eye-closed'} />{p.active === false ? 'Mostrar' : 'Ocultar'}</button>
                        <button type="button" onClick={() => setConfirm('pr:' + p.id)} disabled={prMissing}><Icon name="trash2" />Eliminar</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {tab === 'resenas' && (
      <div className="card">
        <div className="card-head"><div><h2>Reseñas de WhatsApp</h2><p className="sub">Sube capturas de los mensajes de clientes contentos. Aparecen en la web al instante.</p></div></div>
        <form className="f" ref={rvForm} onSubmit={uploadReviews} autoComplete="off">
          <label className="field wide">Capturas<input name="files" type="file" accept="image/png,image/jpeg,image/webp" multiple required style={{ padding: '8px 12px' }} /><span className="hint">Antes de subirla, tapa o recorta el número de teléfono del cliente.</span></label>
          <label className="field">Nombre a mostrar<input name="customer" type="text" autoCapitalize="words" enterKeyHint="done" maxLength={40} placeholder="Ej.: María G." /></label>
          <label className="field">Producto
            <select name="product" defaultValue="general">
              <option value="general">Sin producto específico</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <div className="field wide" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <button type="submit" className="btn btn-dark btn-sm" disabled={busy === 'rv'}><Icon name="upload2" />Subir capturas</button>
            <span className="status" role="status">{rvStatus}</span>
          </div>
        </form>
        <div className="rv-admin">
          {!reviews.length ? (
            <p className="sub">Aún no subiste capturas.</p>
          ) : (
            reviews.map((r) => (
              <figure key={r.id}>
                {r.url ? <img className={r.visible ? '' : 'off'} src={r.url} alt={`Captura de ${r.customer || 'cliente'}`} loading="lazy" /> : <div className="empty">Imagen no disponible</div>}
                <span>{r.customer || 'Sin nombre'}{r.product && r.product !== 'general' ? ', ' + pn(r.product) : ''}{r.visible ? '' : ' (oculta)'}</span>
                <span className="acts">
                  {confirm === 'rv:' + r.id ? (
                    <span className="confirm">¿Eliminar? <button type="button" onClick={() => deleteReview(r)}>Sí</button><button type="button" onClick={() => setConfirm('')}>No</button></span>
                  ) : (
                    <>
                      <button type="button" onClick={() => toggleReview(r)}><Icon name={r.visible ? 'eye-closed' : 'eye'} />{r.visible ? 'Ocultar de la web' : 'Mostrar en la web'}</button>
                      <button type="button" onClick={() => setConfirm('rv:' + r.id)}><Icon name="trash2" />Eliminar</button>
                    </>
                  )}
                </span>
              </figure>
            ))
          )}
        </div>
      </div>
      )}
    </main>
  );
}
