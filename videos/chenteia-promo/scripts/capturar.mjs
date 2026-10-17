// Capturas reales de la web y del panel de San Luyo en vista de celular (390 px, escala 2 → 780 px).
// Uso: node scripts/capturar.mjs  (con la web en localhost:3000 y la pila de prueba)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT = new URL('../capture/mobile/', import.meta.url).pathname;
const BASE = 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' });
const p = await ctx.newPage();
const calm = '[data-reveal]{opacity:1!important;transform:none!important;transition:none!important} .fab{display:none!important} *{animation:none!important;caret-color:transparent!important}';
const out = {};

// 1) La web: portada tal como se ve al entrar
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.addStyleTag({ content: calm });
// Texto de después de la preventa (el que verá la web desde el lunes 19), para que el video no caduque
await p.evaluate(() => {
  const lead = document.querySelector('.card-hero .lead');
  if (lead) lead.textContent = 'Hecha en casa con maní tostado, en botella de 500 ml o de 1 litro. Pídela por WhatsApp y coordinamos la entrega.';
  const btn = document.querySelector('.card-hero a[data-wa]');
  if (btn) for (const n of btn.childNodes) if (n.nodeType === 3) n.textContent = 'Pedir por WhatsApp';
});
await p.waitForTimeout(400);
await p.screenshot({ path: OUT + 'web-portada.png' });

// 2) La tarjeta del producto con 1 y con 2 botellas (sin el encabezado fijo encima)
const sec = 'section.plate:has(#h-chicha-mani)';
await p.addStyleTag({ content: 'header.top{visibility:hidden!important}' });
const fix = () => p.evaluate((s) => { for (const a of document.querySelectorAll(s + ' .cell-wa')) for (const n of a.childNodes) if (n.nodeType === 3) n.textContent = n.textContent.replace('Separar', 'Pedir'); }, sec);
await p.locator(sec).scrollIntoViewIfNeeded(); await fix(); await p.waitForTimeout(300);
await p.locator(sec).screenshot({ path: OUT + 'plato-1.png' });
await p.click(`${sec} .qtys button:has-text("2")`); await fix(); await p.waitForTimeout(300);
await p.locator(sec).screenshot({ path: OUT + 'plato-2.png' });
out.plato = await p.evaluate((s) => {
  const r0 = document.querySelector(s).getBoundingClientRect();
  const rel = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round((r.left - r0.left + r.width / 2) * 2), y: Math.round((r.top - r0.top + r.height / 2) * 2) }; };
  const q2 = [...document.querySelectorAll(s + ' .qtys button')].find((x) => x.textContent.trim() === '2');
  return { alto: Math.round(r0.height * 2), dos: rel(q2), pedir: rel(document.querySelector(s + ' .cell-wa')), total: rel(document.querySelector(s + ' .total')), foto: Math.round(document.querySelector(s + ' .plate-photo').getBoundingClientRect().bottom * 2 - r0.top * 2) };
}, sec);

// 3) El panel: entrar, generar datos de ejemplo y capturar el Resumen
await p.goto(BASE + '/admin/login');
await p.fill('input[name=email]', 'admin@elpuqui.test'); await p.fill('input[name=password]', 'clave-admin-123');
await Promise.all([p.waitForURL(BASE + '/admin'), p.click('button[type=submit]')]);
await p.waitForSelector('.kpi .value');
await p.click('button:has-text("Generar datos de ejemplo")');
await p.waitForSelector('.status:has-text("Listo")', { timeout: 60000 });
await p.reload(); await p.waitForSelector('.kpi .value'); await p.addStyleTag({ content: calm + ' .notice{display:none!important} .status{display:none!important}' });
await p.waitForTimeout(800);
await p.screenshot({ path: OUT + 'panel-resumen.png', fullPage: true });
out.resumenAlto = await p.evaluate(() => document.documentElement.scrollHeight * 2);

// 4) El panel: editar el precio de un producto
await p.click('.tabs button:has-text("Productos")');
await p.waitForSelector('.pr-row'); await p.waitForTimeout(300);
await p.screenshot({ path: OUT + 'panel-productos.png', fullPage: true });
await p.click('.pr-row button:has-text("Editar")'); await p.waitForSelector('#pr-price');
await p.fill('#pr-price', '3.50'); await p.waitForTimeout(200);
await p.evaluate(() => document.querySelector('form.pr-form').scrollIntoView({ block: 'start' }));
await p.evaluate(() => window.scrollBy(0, -80)); await p.waitForTimeout(300);
await p.screenshot({ path: OUT + 'panel-editar.png' });

console.log(JSON.stringify(out));
await b.close();
