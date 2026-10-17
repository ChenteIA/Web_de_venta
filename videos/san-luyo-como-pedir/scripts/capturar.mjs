// Captura la web de San Luyo en vista de celular (390 px de ancho, escala 1.95 → 760 px) para el paso 1.
// Uso: node scripts/capturar.mjs  (con la web corriendo en localhost:3000)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT = new URL('../capture/mobile/', import.meta.url).pathname;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.95, isMobile: true, hasTouch: true })).newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
// Sin animaciones de entrada, y el botón con el texto de después de la preventa ("Pedir")
await p.addStyleTag({ content: '[data-reveal]{opacity:1!important;transform:none!important;transition:none!important} .fab{display:none!important}' });
// El encabezado fijo se captura aparte; en la captura del producto se oculta para que no tape la foto
const noHead = () => p.addStyleTag({ content: 'header.top{visibility:hidden!important}' });
await p.waitForTimeout(200);
await p.locator('header.top').screenshot({ path: OUT + 'encabezado.png' });
const sec = 'section.plate:has(#h-chicha-mani)';
await p.evaluate((s) => { document.querySelector(s).scrollIntoView(); }, sec);
const fix = () => p.evaluate((s) => { for (const a of document.querySelectorAll(s + ' .cell-wa')) for (const n of a.childNodes) if (n.nodeType === 3) n.textContent = n.textContent.replace('Separar', 'Pedir'); }, sec);
await noHead(); await fix(); await p.waitForTimeout(300);
await p.locator(sec + ' .plate-photo').evaluate((e) => e.scrollIntoView());
await p.locator(sec).screenshot({ path: OUT + 'plato-1.png' });
await p.click(`${sec} .qtys button:has-text("2")`); await fix(); await p.waitForTimeout(300);
await p.locator(sec).screenshot({ path: OUT + 'plato-2.png' });
// Posiciones (en px de la captura) del botón "2" y del botón de pedir, para los toques
const box = await p.evaluate((s) => {
  const r0 = document.querySelector(s).getBoundingClientRect();
  const rel = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round((r.left - r0.left + r.width / 2) * 1.95), y: Math.round((r.top - r0.top + r.height / 2) * 1.95) }; };
  const q2 = [...document.querySelectorAll(s + ' .qtys button')].find((x) => x.textContent.trim() === '2');
  return { alto: Math.round(r0.height * 1.95), ancho: Math.round(r0.width * 1.95), dos: rel(q2), pedir: rel(document.querySelector(s + ' .cell-wa')), total: rel(document.querySelector(s + ' .total')), selector: rel(document.querySelector(s + ' .qtys')) };
}, sec);
console.log(JSON.stringify(box));
await b.close();
