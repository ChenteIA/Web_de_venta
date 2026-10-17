# Genera el video "ChenteIA · la web de tu negocio" (HyperFrames, 1080x1920, ~43 s, con voz y música).
# Uso: python3 scripts/gen.py   (escribe compositions/frames/*.html e index.html)
import os, json, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1080, 1920
BG, INK, SOFT, ACC, GREEN, CREAM = "#12151A", "#F5F2EE", "#AEB4BE", "#FFC247", "#2E9E5B", "#FAF4F1"
WA_PATH = open(f"{ROOT}/scripts/wa-path.svg").read().strip()
WA = f'<svg viewBox="0 0 361 362" aria-hidden="true">{WA_PATH}</svg>'
FONTS = '''@font-face { font-family: "Figtree"; src: url("assets/fonts/figtree-latin.woff2") format("woff2"); font-weight: 300 900; }
    @font-face { font-family: "Gloock"; src: url("assets/fonts/gloock-latin.woff2") format("woff2"); font-weight: 400; }'''

# ---------------------------------------------------------------- narración: cuándo empieza cada frase
LINES = [
    "¿Tu negocio vende por WhatsApp, pero todavía no tiene web?",
    "Mira esto: es San Luyo, una chicha de maní de Ica.",
    "El cliente entra, elige el tamaño y cuántas botellas quiere, y con un toque te llega el pedido listo por WhatsApp, con el total calculado.",
    "Y no es solo la página: el dueño tiene su propio panel.",
    "Desde el celular cambia precios y fotos, sube reseñas, y ve cuántas personas tocaron el botón y cuántas compraron.",
    "Rápida, segura, y hecha a la medida de tu negocio.",
    "En ChenteIA hacemos la web de tu negocio. Escríbenos.",
]
START = [0.4, 4.6, 8.5, 18.2, 22.3, 30.6, 34.5]
def dur(i):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{ROOT}/assets/voz/l{i + 1}.wav"], capture_output=True, text=True).stdout
    return round(float(out), 3)
DUR = [dur(i) for i in range(len(LINES))]
TOTAL = 43.0
# Escenas: gancho, teléfono (caso San Luyo + panel), valores, cierre
T_PHONE, T_VAL, T_END = 4.3, 30.3, 34.3


def comp(fid, d, css, body, script):
    return f'''<template>
  <script src="assets/vendor/gsap.min.js"></script>
  <style>
    {FONTS}
    #root {{ position: absolute; inset: 0; width: {W}px; height: {H}px; overflow: hidden; color: {INK}; font-family: "Figtree", sans-serif; }}
    {css}
  </style>
  <div id="root" data-composition-id="{fid}" data-width="{W}" data-height="{H}" data-duration="{d}">
    {body}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{script}
      tl.to({{}}, {{ duration: 0.01 }}, {round(d - 0.01, 2)});
      window.__timelines = window.__timelines || {{}};
      window.__timelines["{fid}"] = tl;
    }})();
  </script>
</template>
'''

def write(fid, html):
    os.makedirs(f"{ROOT}/compositions/frames", exist_ok=True)
    open(f"{ROOT}/compositions/frames/{fid}.html", "w").write(html)


# ---------------------------------------------------------------- 00 · Fondo (todo el video)
write("00-fondo", comp("00-fondo", TOTAL, f'''
    #f-bg {{ position: absolute; inset: 0; background: {BG}; }}
    #f-dots {{ position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px); background-size: 44px 44px; }}
    #f-glow {{ position: absolute; left: -300px; top: 900px; width: 1200px; height: 1200px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 194, 71, 0.16), rgba(255, 194, 71, 0)); }}''',
    f'''<div id="f-bg" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
    <div id="f-dots"></div>
    <div id="f-glow"></div>''',
    f'''      // Un brillo cálido detrás del avatar que se mueve muy despacio
      tl.fromTo("#f-glow", {{ x: 0, y: 0 }}, {{ x: 160, y: -120, duration: {TOTAL / 2}, ease: "sine.inOut", yoyo: true, repeat: 1 }}, 0);'''))


# ---------------------------------------------------------------- 01 · Gancho (0 – 4.3 s)
write("01-gancho", comp("01-gancho", T_PHONE, f'''
    #g-kick {{ position: absolute; left: 80px; top: 230px; font-size: 40px; font-weight: 700; letter-spacing: 0.04em; color: {ACC}; opacity: 0; }}
    #g-t {{ position: absolute; left: 80px; right: 80px; top: 300px; font-size: 108px; line-height: 1.02; font-weight: 850; letter-spacing: -0.03em; }}
    #g-t span {{ display: block; opacity: 0; }}
    #g-t em {{ font-style: normal; color: {ACC}; }}''',
    '''<p id="g-kick">ChenteIA · webs para negocios</p>
    <h1 id="g-t"><span>¿Tu negocio vende</span><span>por WhatsApp…</span><span>pero aún <em>no tiene</em></span><span><em>web?</em></span></h1>''',
    f'''      // Escena 1 (0.0–2.0s): la pregunta entra línea por línea, al ritmo de la voz
      tl.fromTo("#g-kick", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }}, 0.2);
      tl.fromTo("#g-t span", {{ opacity: 0, y: 50 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.42 }}, {START[0]});
      // Escena 2 (3.9–4.3s): sale hacia arriba para dar paso al teléfono
      tl.to(["#g-kick", "#g-t"], {{ opacity: 0, y: -40, duration: 0.35, ease: "power2.in" }}, {T_PHONE - 0.4});'''))


# ---------------------------------------------------------------- 02 · Teléfono: San Luyo para el cliente y para el dueño
PX, PY, PW, PH = 452, 330, 590, 1210          # marco del teléfono
BZ = 16                                       # bisel
SW, SH = PW - 2 * BZ, PH - 2 * BZ             # pantalla: 558 x 1178
K = SW / 780                                  # las capturas miden 780 px de ancho
def sc(v): return round(v * K)
PL_W, PL_H = sc(732), sc(1790)                # tarjeta del producto (732 px de ancho)
PL_X = (SW - PL_W) // 2
PLATO = {"dos": (204, 1325), "pedir": (366, 1592), "total": (366, 1451)}
PL_S0, PL_S1 = 0, sc(1790) - SH + sc(40)      # scroll: de la foto al botón
RES_H = sc(4832)
L = lambda gl: round(gl - T_PHONE, 2)         # tiempo global → local de esta escena

def scr(pt, scroll):  # punto de la tarjeta → coordenadas en el lienzo
    return PX + BZ + PL_X + sc(pt[0]), PY + BZ + sc(pt[1]) - scroll

MSG = "Hola San Luyo, quiero pedir 2 botellas de chicha de maní (500 ml, S/ 3 c/u = S/ 6). ¿Para cuándo las tienen?"
CHECKS = '<svg viewBox="0 0 28 16" aria-hidden="true"><path d="M1 9l4.5 4.5L14 4M10 13.5l1 1L20 4" fill="none" stroke="#9FD3AE" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
d2 = T_VAL - T_PHONE
dx, dy = scr(PLATO["dos"], PL_S1); px_, py_ = scr(PLATO["pedir"], PL_S1); tx, ty = scr(PLATO["total"], PL_S1)

CHIPS_A = ["Elige tamaño y cantidad", "Pedido listo por WhatsApp", "Con el total calculado"]
CHIPS_B = ["Cambia precios y fotos", "Sube reseñas", "Ve clics y ventas"]
def chips(pre, items):
    return "".join(f'<div id="{pre}{i}" class="chip"><b>{i + 1}</b>{t}</div>' for i, t in enumerate(items))

write("02-telefono", comp("02-telefono", d2, f'''
    #t-head {{ position: absolute; left: 60px; top: 150px; right: 60px; }}
    #t-head p {{ position: absolute; left: 0; top: 0; font-size: 38px; font-weight: 700; color: {ACC}; opacity: 0; white-space: nowrap; }}
    #t-head h2 {{ position: absolute; left: 0; top: 52px; font-size: 76px; font-weight: 850; letter-spacing: -0.02em; line-height: 1.05; opacity: 0; white-space: nowrap; }}
    #t-phone {{ position: absolute; left: {PX}px; top: {PY}px; width: {PW}px; height: {PH}px; border-radius: 72px; background: #050608; box-shadow: 0 0 0 3px #2A2F38 inset; }}
    #t-screen {{ position: absolute; left: {BZ}px; top: {BZ}px; width: {SW}px; height: {SH}px; border-radius: 58px; overflow: hidden; background: #FFFFFF; }}
    .scr {{ position: absolute; left: 0; top: 0; width: {SW}px; opacity: 0; }}
    .scr img {{ display: block; width: 100%; }}
    #t-plate {{ position: absolute; left: {PL_X}px; top: 0; width: {PL_W}px; height: {PL_H}px; }}
    #t-plate img {{ position: absolute; left: 0; top: 0; width: {PL_W}px; height: {PL_H}px; }}
    #t-plate2 {{ opacity: 0; }}
    #t-webwrap {{ background: #FFFFFF; height: {SH}px; overflow: hidden; }}
    #t-chat {{ height: {SH}px; background: #EFE6E1; }}
    #t-bar {{ position: absolute; left: 0; top: 0; right: 0; height: 132px; padding: 44px 26px 0; background: #2B1B18; display: flex; align-items: center; gap: 16px; color: {CREAM}; }}
    #t-bar img {{ width: 60px; height: 60px; border-radius: 50%; }}
    #t-bar b {{ display: block; font-size: 30px; font-weight: 650; }}
    #t-bar small {{ display: block; font-size: 20px; color: #CDBBB3; }}
    .bubble {{ position: absolute; right: 20px; max-width: 450px; padding: 18px 22px 14px; border-radius: 26px 26px 8px 26px; background: #2E6B3B; color: #FFF; font-size: 27px; line-height: 1.32; opacity: 0; }}
    .bubble small {{ display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin-top: 6px; font-size: 19px; opacity: 0.85; }}
    .bubble small svg {{ width: 26px; height: 15px; }}
    #t-in {{ left: 20px; right: auto; border-radius: 26px 26px 26px 8px; background: #FFF; color: #2B1B18; }}
    #t-res {{ top: 0; }}
    .hl {{ position: absolute; border-radius: 18px; border: 5px solid {ACC}; opacity: 0; }}
    .ring {{ position: absolute; width: 110px; height: 110px; margin: -55px 0 0 -55px; border-radius: 50%; background: rgba(255, 194, 71, 0.35); border: 7px solid {ACC}; opacity: 0; }}
    .chips {{ position: absolute; left: 50px; top: 400px; width: 400px; }}
    .chip {{ position: relative; display: flex; align-items: center; gap: 16px; margin-bottom: 18px; padding: 18px 22px; border-radius: 22px; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.12); font-size: 31px; font-weight: 650; line-height: 1.2; opacity: 0; }}
    .chip b {{ display: flex; align-items: center; justify-content: center; flex: none; width: 50px; height: 50px; border-radius: 50%; background: {ACC}; color: {BG}; font-size: 28px; font-weight: 850; }}''',
    f'''<div id="t-head">
      <p id="t-k1">Caso real · Ica, Perú</p><h2 id="t-h1">La web de San Luyo</h2>
      <p id="t-k2">Para el cliente</p><h2 id="t-h2">Pide en 2 toques</h2>
      <p id="t-k3">Para el dueño</p><h2 id="t-h3">Su propio panel</h2>
    </div>
    <div class="chips" id="t-ca">{chips("t-a", CHIPS_A)}</div>
    <div class="chips" id="t-cb">{chips("t-b", CHIPS_B)}</div>
    <div id="t-phone" data-layout-allow-overflow>
      <div id="t-screen">
        <div id="t-portada" class="scr"><img src="assets/web-portada.png" alt="Portada de la web de San Luyo en el celular"></div>
        <div id="t-webwrap" class="scr"><div id="t-plate">
          <img id="t-plate1" src="assets/plato-1.png" alt="La chicha de 500 ml a S/ 3 en la web">
          <img id="t-plate2" src="assets/plato-2.png" alt="La misma tarjeta con 2 botellas: S/ 6">
        </div></div>
        <div id="t-chat" class="scr">
          <div id="t-bar"><img src="assets/sanluyo-logo.png" alt=""><div><b>San Luyo</b><small>en línea</small></div></div>
          <div id="t-out" class="bubble" style="top:170px">{MSG}<small>9:41 {CHECKS}</small></div>
          <div id="t-in" class="bubble" style="top:460px">¡Hola! Sí tenemos. Te las llevamos mañana.<small>9:42</small></div>
        </div>
        <div id="t-res" class="scr"><img src="assets/panel-resumen.png" alt="Resumen del panel: clics, ventas, monto y conversión"></div>
        <div id="t-edit" class="scr"><img src="assets/panel-editar.png" alt="Editar el precio de la chicha en el panel"></div>
        <div id="t-hlprice" class="hl" style="left:{sc(96)}px;top:{sc(644)}px;width:{sc(588)}px;height:{sc(112)}px"></div>
        <div id="t-hlkpi" class="hl" style="left:{sc(24)}px;top:{sc(664)}px;width:{sc(732)}px;height:{sc(298)}px"></div>
      </div>
    </div>
    <div id="t-r1" class="ring" style="left:{dx}px;top:{dy}px"></div>
    <div id="t-r2" class="ring" style="left:{px_}px;top:{py_}px"></div>''',
    f'''      function inOut(sel, tin, tout) {{
        tl.fromTo(sel, {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }}, tin);
        if (tout != null) tl.to(sel, {{ opacity: 0, y: -16, duration: 0.3, ease: "power2.in" }}, tout);
      }}
      function show(sel, t) {{ tl.fromTo(sel, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, t); }}
      function hide(sel, t) {{ tl.to(sel, {{ opacity: 0, duration: 0.3 }}, t); }}
      function tap(sel, t) {{ tl.fromTo(sel, {{ opacity: 1, scale: 0.4 }}, {{ opacity: 0, scale: 1.8, duration: 0.6, ease: "power2.out", immediateRender: false }}, t); }}
      const plate = document.getElementById("t-plate");
      const v = {{ s: {PL_S0} }};
      function apply() {{ plate.style.top = (-v.s) + "px"; }}
      apply();

      // Escena 1 (0.0–4.2s): el teléfono entra con la web de San Luyo — "Mira esto: es San Luyo"
      tl.fromTo("#t-phone", {{ y: 700, rotate: 6 }}, {{ y: 0, rotate: 0, duration: 0.8, ease: "power3.out" }}, 0.05);
      show("#t-portada", 0.05);
      inOut("#t-k1", 0.3, {L(8.3)}); inOut("#t-h1", 0.4, {L(8.3)});

      // Escena 2 (4.2–13.9s): para el cliente — elige, toca y llega el pedido por WhatsApp
      inOut("#t-k2", {L(8.5)}, {L(18.0)}); inOut("#t-h2", {L(8.6)}, {L(18.0)});
      show("#t-webwrap", {L(8.4)}); hide("#t-portada", {L(8.6)});
      tl.to(v, {{ s: {PL_S1}, duration: 1.6, ease: "power2.inOut", onUpdate: apply }}, {L(8.9)});
      inOut("#t-a0", {L(9.4)}, null);
      tap("#t-r1", {L(11.0)}); tl.to("#t-plate2", {{ opacity: 1, duration: 0.1 }}, {L(11.1)});
      tap("#t-r2", {L(12.9)});
      inOut("#t-a1", {L(13.0)}, null);
      tl.fromTo("#t-chat", {{ opacity: 0, x: 90 }}, {{ opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }}, {L(13.4)});
      tl.fromTo("#t-out", {{ opacity: 0, y: 120 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }}, {L(13.9)});
      inOut("#t-a2", {L(15.6)}, null);
      tl.fromTo("#t-in", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }}, {L(16.6)});
      tl.to("#t-ca", {{ opacity: 0, duration: 0.3 }}, {L(18.0)});

      // Escena 3 (13.9–26.0s): para el dueño — su panel: resumen, editar precio, clics y ventas
      inOut("#t-k3", {L(18.3)}, null); inOut("#t-h3", {L(18.4)}, null);
      tl.fromTo("#t-res", {{ opacity: 0, x: 90 }}, {{ opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }}, {L(18.3)});
      hide("#t-chat", {L(18.6)});
      show("#t-edit", {L(22.4)}); inOut("#t-b0", {L(22.5)}, null);
      tl.to("#t-hlprice", {{ opacity: 1, duration: 0.25 }}, {L(23.0)}); tl.to("#t-hlprice", {{ opacity: 0, duration: 0.25 }}, {L(25.2)});
      inOut("#t-b1", {L(24.8)}, null);
      hide("#t-edit", {L(26.0)});
      inOut("#t-b2", {L(26.3)}, null);
      tl.to("#t-hlkpi", {{ opacity: 1, duration: 0.25 }}, {L(26.6)});
      // Salida (25.6–26.0s): el teléfono se va por la derecha
      tl.to(["#t-phone", "#t-head", "#t-cb"], {{ opacity: 0, x: 120, duration: 0.4, ease: "power2.in" }}, {round(d2 - 0.45, 2)});'''))


# ---------------------------------------------------------------- 03 · Valores (30.3 – 34.3 s)
d3 = T_END - T_VAL
write("03-valores", comp("03-valores", d3, f'''
    .v {{ position: absolute; right: 70px; text-align: right; font-size: 128px; font-weight: 850; letter-spacing: -0.03em; line-height: 1; opacity: 0; }}
    #v1 {{ top: 360px; }} #v2 {{ top: 520px; color: {ACC}; }} #v3 {{ top: 680px; font-size: 100px; }}
    #v-sub {{ position: absolute; right: 70px; top: 820px; font-size: 44px; color: {SOFT}; opacity: 0; }}''',
    '''<p id="v1" class="v">Rápida.</p><p id="v2" class="v">Segura.</p><p id="v3" class="v">A tu medida.</p>
    <p id="v-sub">Hecha para tu negocio</p>''',
    f'''      // Escena 1 (0.3–3.4s): las tres palabras, una por cada idea de la voz
      tl.fromTo(".v", {{ opacity: 0, x: 80 }}, {{ opacity: 1, x: 0, duration: 0.45, ease: "power3.out", stagger: 0.75 }}, {round(START[5] - T_VAL + 0.05, 2)});
      tl.fromTo("#v-sub", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {round(START[5] - T_VAL + 2.2, 2)});
      // Escena 2 (3.6–4.0s): salen para el cierre
      tl.to([".v", "#v-sub"], {{ opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }}, {round(d3 - 0.4, 2)});'''))


# ---------------------------------------------------------------- 04 · Cierre (34.3 – 43 s)
d4 = TOTAL - T_END
write("04-cierre", comp("04-cierre", d4, f'''
    #c-brand {{ position: absolute; left: 0; right: 0; top: 210px; text-align: center; font-size: 132px; font-weight: 900; letter-spacing: -0.04em; opacity: 0; }}
    #c-brand span {{ color: {ACC}; }}
    #c-line {{ position: absolute; left: 80px; right: 80px; top: 380px; text-align: center; font-size: 54px; font-weight: 650; line-height: 1.2; opacity: 0; }}
    #c-wa {{ position: absolute; left: 110px; right: 110px; top: 560px; height: 170px; border-radius: 999px; background: {GREEN}; display: flex; align-items: center; justify-content: center; gap: 26px; color: #FFF; opacity: 0; }}
    #c-wa svg {{ width: 84px; height: 84px; color: #FFF; }}
    #c-wa b {{ font-size: 84px; font-weight: 850; letter-spacing: 0.01em; font-variant-numeric: tabular-nums; }}
    #c-cta {{ position: absolute; left: 0; right: 0; top: 760px; text-align: center; font-size: 44px; color: {SOFT}; opacity: 0; }}''',
    f'''<p id="c-brand">Chente<span>IA</span></p>
    <p id="c-line">Hacemos la web de tu negocio</p>
    <div id="c-wa">{WA}<b>971 114 393</b></div>
    <p id="c-cta">Escríbenos por WhatsApp</p>''',
    f'''      // Escena 1 (0.2–3.7s): la marca y la promesa, con la voz
      tl.fromTo("#c-brand", {{ opacity: 0, scale: 0.9 }}, {{ opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)" }}, {round(START[6] - T_END, 2)});
      tl.fromTo("#c-line", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }}, {round(START[6] - T_END + 0.6, 2)});
      // Escena 2 (2.4–8.7s): el WhatsApp grande, para tomar captura o escribir
      tl.fromTo("#c-wa", {{ opacity: 0, y: 40, scale: 0.95 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" }}, {round(START[6] - T_END + 2.0, 2)});
      tl.fromTo("#c-cta", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {round(START[6] - T_END + 2.6, 2)});
      tl.to("#c-wa", {{ scale: 1.04, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 5 }}, {round(START[6] - T_END + 3.4, 2)});'''))


# ---------------------------------------------------------------- 05 · Avatar (todo el video): pose según lo que dice
# Las imágenes miden 768x1376. Tres encuadres: grande abajo al centro, pequeño abajo a la izquierda, grande al cierre.
POSES = [("saluda", 0, 4.3), ("senala", 4.3, 18.1), ("presenta", 18.1, 30.3), ("pulgar", 30.3, TOTAL)]
write("05-avatar", comp("05-avatar", TOTAL, f'''
    #a-box {{ position: absolute; left: 0; top: 0; width: 768px; height: 1376px; transform-origin: 50% 100%; }}
    #a-box img {{ position: absolute; left: 0; top: 0; width: 768px; height: 1376px; opacity: 0; }}
    #a-presenta {{ }}
    #a-shadow {{ position: absolute; left: 230px; top: 1340px; width: 310px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.45); filter: blur(10px); }}''',
    '''<div id="a-box"><div id="a-shadow"></div>
      <img id="a-saluda" src="assets/avatar/saluda.png" alt="Avatar de ChenteIA saludando">
      <img id="a-senala" src="assets/avatar/senala.png" alt="Avatar señalando la web">
      <img id="a-presenta" src="assets/avatar/presenta.png" alt="Avatar presentando el panel">
      <img id="a-pulgar" src="assets/avatar/pulgar.png" alt="Avatar con el pulgar arriba">
    </div>''',
    f'''      const box = "#a-box";
      // Encuadres (x, y en px del lienzo; s = escala): grande al centro → pequeño a la izquierda → grande al cierre
      // El origen de la escala es el pie (50% 100%): con y = 584 los pies quedan al borde inferior en cualquier tamaño
      tl.set(box, {{ x: 16, y: 584, scale: 0.84 }}, 0);
      tl.fromTo(box, {{ y: 900, opacity: 0 }}, {{ y: 584, opacity: 1, duration: 0.6, ease: "power3.out" }}, 0.0);
      tl.to(box, {{ x: -154, scale: 0.72, duration: 0.7, ease: "power3.inOut" }}, {T_PHONE - 0.2});
      tl.to(box, {{ x: -120, scale: 0.78, duration: 0.5, ease: "power2.inOut" }}, {T_VAL});
      tl.to(box, {{ x: 156, scale: 0.74, duration: 0.7, ease: "power3.inOut" }}, {T_END - 0.1});
      // Poses: cambio rápido con un pequeño rebote, como si se moviera
      {"".join(f'''tl.set("#a-{n}", {{ opacity: 1 }}, {t0});{"" if t1 >= TOTAL else f''' tl.set("#a-{n}", {{ opacity: 0 }}, {t1});'''}
      ''' for n, t0, t1 in POSES)}
      tl.set("#a-presenta", {{ scaleX: -1, transformOrigin: "50% 50%" }}, 0); // la mano abierta apunta hacia el teléfono
      {"".join(f'''tl.fromTo("#a-{n}", {{ y: 18 }}, {{ y: 0, duration: 0.35, ease: "back.out(2)", immediateRender: false }}, {t0});
      ''' for n, t0, t1 in POSES[1:])}
      // Mientras habla: un balanceo suave (respiración) que no se detiene
      tl.fromTo("#a-box img", {{ rotate: -0.8, transformOrigin: "50% 100%" }}, {{ rotate: 0.8, duration: 1.3, ease: "sine.inOut", yoyo: true, repeat: {int(TOTAL / 1.3)}, immediateRender: false }}, 0.6);'''))


# ---------------------------------------------------------------- 06 · Subtítulos (frases 2–5; las demás ya se leen en pantalla)
def chunks(text):
    parts = re.split(r"(?<=[,:.?¿])\s+", text)
    out = []
    for p in parts:
        words = p.split()
        while len(words) > 6:
            out.append(" ".join(words[:5])); words = words[5:]
        if words: out.append(" ".join(words))
    return out
caps = []
for i in [1, 2, 3, 4]:
    cs = chunks(LINES[i]); total_chars = sum(len(c) for c in cs); t = START[i]
    for c in cs:
        d = DUR[i] * len(c) / total_chars
        caps.append((round(t, 2), round(d, 2), c)); t += d
cap_html = "".join(f'<p id="s{k}" class="cap">{c}</p>' for k, (t, d, c) in enumerate(caps))
cap_js = "".join(f'''      tl.set("#s{k}", {{ opacity: 1 }}, {t}); tl.set("#s{k}", {{ opacity: 0 }}, {round(t + d, 2)});
''' for k, (t, d, c) in enumerate(caps))
write("06-subtitulos", comp("06-subtitulos", TOTAL, f'''
    .cap {{ position: absolute; left: 60px; right: 60px; top: 1580px; text-align: center; font-size: 52px; font-weight: 800; line-height: 1.15; color: #FFF; opacity: 0;
      text-shadow: 0 3px 0 #000, 0 -3px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 0 6px 18px rgba(0,0,0,0.7); }}''',
    cap_html,
    "      // Cada trozo de la frase aparece mientras la voz lo dice\n" + cap_js))


# ---------------------------------------------------------------- index.html
SCENES = [("01-gancho", 0, T_PHONE), ("02-telefono", T_PHONE, d2), ("03-valores", T_VAL, d3), ("04-cierre", T_END, d4)]
els = "\n".join(f'''      <div id="el-{fid}" class="scene" data-composition-id="{fid}" data-composition-src="compositions/frames/{fid}.html" data-start="{st}" data-duration="{round(d, 2)}" data-track-index="1"></div>''' for fid, st, d in SCENES)
voices = "\n".join(f'''      <audio id="el-voz-{i + 1}" src="assets/voz/l{i + 1}.wav" data-start="{START[i]}" data-duration="{DUR[i]}" data-track-index="{10 + i}" data-volume="1"></audio>''' for i in range(len(LINES)))
open(f"{ROOT}/index.html", "w").write(f'''<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; background: {BG}; }}
      .scene {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}">
      <div id="el-00-fondo" class="scene" data-composition-id="00-fondo" data-composition-src="compositions/frames/00-fondo.html" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
{els}
      <div id="el-05-avatar" class="scene" data-composition-id="05-avatar" data-composition-src="compositions/frames/05-avatar.html" data-start="0" data-duration="{TOTAL}" data-track-index="2"></div>
      <div id="el-06-subtitulos" class="scene" data-composition-id="06-subtitulos" data-composition-src="compositions/frames/06-subtitulos.html" data-start="0" data-duration="{TOTAL}" data-track-index="3"></div>
{voices}
      <audio id="el-musica" src="assets/musica.mp3" data-start="0" data-duration="{TOTAL}" data-track-index="20" data-volume="0.16"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
      tl.to({{}}, {{ duration: {TOTAL} }}, 0); // ancla: la línea de tiempo dura el video completo
    </script>
  </body>
</html>
''')
print("ok", "voz:", DUR, "subtítulos:", len(caps))
