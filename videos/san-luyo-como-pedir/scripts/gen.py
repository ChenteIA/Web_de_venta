# Genera las escenas del video "San Luyo · Cómo hacer tu pedido" (HyperFrames, 1080x1350, 20 s, sin sonido).
# Uso: python3 scripts/gen.py   (escribe compositions/frames/*.html e index.html)
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1080, 1350

CREAM, INK, RED, GREEN, SOFT = "#FAF4F1", "#2B1B18", "#A61D27", "#2E6B3B", "#7A635C"
FONTS = '''@font-face { font-family: "Gloock"; src: url("assets/fonts/gloock-latin.woff2") format("woff2"); font-weight: 400; }
    @font-face { font-family: "Figtree"; src: url("assets/fonts/figtree-latin.woff2") format("woff2"); font-weight: 300 900; }'''

# Franja de toldo (bloques rojos y crema), como en la web
def awning(pid, top=0, h=30):
    cells = "".join(f'<i style="left:{i * 60}px;background:{RED if i % 2 == 0 else CREAM}"></i>' for i in range(W // 60 + 1))
    return f'<div id="{pid}-awning" class="awning" data-layout-allow-overflow style="top:{top}px;height:{h}px">{cells}</div>'

AWNING_CSS = ".awning { position: absolute; left: 0; width: 1080px; overflow: hidden; } .awning i { position: absolute; top: 0; width: 60px; height: 100%; }"

# Encabezado de paso: número en círculo rojo + texto. Cada paso es un bloque que entra y sale.
STEP_CSS = f'''.step {{ position: absolute; left: 0; right: 0; top: 104px; display: flex; align-items: center; justify-content: center; gap: 26px; opacity: 0; }}
    .step b {{ display: flex; align-items: center; justify-content: center; width: 92px; height: 92px; border-radius: 50%; background: {RED}; color: {CREAM}; font-family: "Gloock", serif; font-weight: 400; font-size: 56px; line-height: 1; flex: none; }}
    .step span {{ font-family: "Gloock", serif; font-size: 66px; line-height: 1.05; letter-spacing: -0.01em; color: {INK}; white-space: nowrap; }}'''

def step(pid, n, text):
    return f'<div id="{pid}" class="step"><b>{n}</b><span>{text}</span></div>'

STEP_JS = '''      function stepIn(sel, t) { tl.fromTo(sel, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, t); }
      function stepOut(sel, t) { tl.to(sel, { opacity: 0, y: -18, duration: 0.3, ease: "power2.in" }, t); }
      function tap(sel, t) { tl.fromTo(sel, { opacity: 0.95, scale: 0.4 }, { opacity: 0, scale: 1.8, duration: 0.6, ease: "power2.out", immediateRender: false }, t); }
'''
RING_CSS = f".ring {{ position: absolute; width: 130px; height: 130px; margin: -65px 0 0 -65px; border-radius: 50%; background: rgba(250, 244, 241, 0.45); border: 8px solid {INK}; opacity: 0; }}"


def comp(fid, dur, css, body, script):
    return f'''<template>
  <script src="assets/vendor/gsap.min.js"></script>
  <style>
    {FONTS}
    #root {{ position: absolute; inset: 0; width: {W}px; height: {H}px; overflow: hidden; color: {INK}; font-family: "Figtree", sans-serif; }}
    {css}
  </style>
  <div id="root" data-composition-id="{fid}" data-width="{W}" data-height="{H}" data-duration="{dur}">
    {body}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{script}
      tl.to({{}}, {{ duration: 0.01 }}, {round(dur - 0.01, 2)});
      window.__timelines = window.__timelines || {{}};
      window.__timelines["{fid}"] = tl;
    }})();
  </script>
</template>
'''


def write(fid, html):
    os.makedirs(f"{ROOT}/compositions/frames", exist_ok=True)
    open(f"{ROOT}/compositions/frames/{fid}.html", "w").write(html)


# ---------------------------------------------------------------- 01 · Título (2.6 s)
write("01-titulo", comp("01-titulo", 2.6, f'''
    #t01-bg {{ position: absolute; inset: 0; background: {CREAM}; }}
    {AWNING_CSS}
    #t01-logo {{ position: absolute; left: 450px; top: 300px; width: 180px; height: 180px; }}
    #t01-kicker {{ position: absolute; left: 0; right: 0; top: 540px; text-align: center; font-size: 40px; font-weight: 600; color: {RED}; opacity: 0; }}
    #t01-title {{ position: absolute; left: 70px; right: 70px; top: 610px; text-align: center; font-family: "Gloock", serif; font-weight: 400; font-size: 128px; line-height: 1.0; letter-spacing: -0.02em; }}
    #t01-title span {{ display: block; opacity: 0; }}
    #t01-sub {{ position: absolute; left: 0; right: 0; top: 900px; text-align: center; font-size: 46px; color: {SOFT}; opacity: 0; }}''',
    f'''<div id="t01-bg" class="clip" data-start="0" data-duration="2.6" data-track-index="0"></div>
    {awning("t01")}
    <img id="t01-logo" src="assets/logo.png" alt="Logo de San Luyo">
    <p id="t01-kicker">San Luyo · chicha de maní</p>
    <h1 id="t01-title"><span>Cómo hacer</span><span>tu pedido</span></h1>
    <p id="t01-sub">5 pasos, todo por WhatsApp</p>''',
    '''      // Escena 1 (0.0–1.2s): el logo y el titular entran de arriba hacia abajo
      tl.fromTo("#t01-logo", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, 0.05);
      tl.fromTo("#t01-kicker", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.3);
      tl.fromTo("#t01-title span", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.16 }, 0.45);
      // Escena 2 (1.2–2.6s): la promesa "5 pasos" y lectura quieta
      tl.fromTo("#t01-sub", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 1.15);'''))


# ---------------------------------------------------------------- 02 · Teléfono: pasos 1, 2 y 3 (11 s)
# El celular: tarjeta de 760 px centrada, desde y=300 hasta el borde inferior.
PX, PY, PW = 160, 300, 760
HEAD_H = round(125 * PW / 761)          # encabezado de la web escalado al ancho del celular
VY = PY + HEAD_H                        # inicio de la zona visible de la página
PLATE_X = (PW - 714) // 2               # la captura del producto mide 714 px de ancho
S0, S1 = 120, 870                       # scroll inicial (foto) y final (selector + botón)
DOS = (199, 1342); PEDIR = (357, 1602); TOTAL_Y = 1464   # posiciones medidas en la captura (scripts/capturar.mjs)

def on_screen(pt, scroll):
    return PX + PLATE_X + pt[0], VY + pt[1] - scroll

MSG = "Hola San Luyo, quiero pedir 2 botellas de chicha de maní (500 ml, S/ 3 c/u = S/ 6). ¿Para cuándo las tienen?"
SEND_SVG = f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z" fill="{CREAM}"/></svg>'
CHECKS = '<svg viewBox="0 0 28 16" aria-hidden="true"><path d="M1 9l4.5 4.5L14 4M10 13.5l1 1L20 4" fill="none" stroke="#9FD3AE" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

dos_x, dos_y = on_screen(DOS, S1)
ped_x, ped_y = on_screen(PEDIR, S1)

write("02-telefono", comp("02-telefono", 11.0, f'''
    #p02-bg {{ position: absolute; inset: 0; background: {CREAM}; }}
    {AWNING_CSS}
    {STEP_CSS}
    {RING_CSS}
    #p02-phone {{ position: absolute; left: {PX}px; top: {PY}px; width: {PW}px; height: {H - PY + 40}px; border-radius: 52px 52px 0 0; background: #FFFFFF; border: 3px solid #E6D8D1; border-bottom: 0; overflow: hidden; }}
    #p02-web, #p02-chat {{ position: absolute; inset: 0; }}
    #p02-head {{ position: absolute; left: 0; top: 0; width: {PW}px; height: {HEAD_H}px; }}
    #p02-view {{ position: absolute; left: 0; top: {HEAD_H}px; width: {PW}px; bottom: 0; overflow: hidden; }}
    #p02-plate {{ position: absolute; left: {PLATE_X}px; top: 0; width: 714px; height: 1796px; }}
    #p02-plate img {{ position: absolute; left: 0; top: 0; width: 714px; height: 1796px; }}
    #p02-plate2 {{ opacity: 0; }}
    .hl {{ position: absolute; border-radius: 22px; background: rgba(226, 168, 75, 0.28); opacity: 0; }}
    #p02-chat {{ background: #EFE6E1; opacity: 0; }}
    #p02-bar {{ position: absolute; left: 0; top: 0; right: 0; height: 128px; background: {INK}; display: flex; align-items: center; gap: 20px; padding: 0 30px; color: {CREAM}; }}
    #p02-bar img {{ width: 76px; height: 76px; border-radius: 50%; }}
    #p02-bar b {{ display: block; font-size: 36px; font-weight: 650; }}
    #p02-bar small {{ display: block; font-size: 24px; color: #CDBBB3; }}
    .bubble {{ position: absolute; max-width: 590px; padding: 22px 26px 18px; border-radius: 30px; font-size: 32px; line-height: 1.32; opacity: 0; }}
    .out {{ right: 26px; background: {GREEN}; color: #FFFFFF; border-bottom-right-radius: 8px; }}
    .in {{ left: 26px; background: #FFFFFF; color: {INK}; border-bottom-left-radius: 8px; }}
    .bubble small {{ display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 6px; font-size: 22px; opacity: 0.8; }}
    .bubble small svg {{ width: 30px; height: 18px; }}
    #p02-input {{ position: absolute; left: 22px; right: 22px; bottom: 70px; display: flex; align-items: flex-end; gap: 16px; }}
    #p02-field {{ flex: 1; min-height: 96px; padding: 20px 26px; border-radius: 34px; background: #FFFFFF; font-size: 30px; line-height: 1.3; color: {INK}; }}
    #p02-field span {{ opacity: 0; }}
    #p02-send {{ width: 96px; height: 96px; border-radius: 50%; background: {GREEN}; display: flex; align-items: center; justify-content: center; flex: none; }}
    #p02-send svg {{ width: 46px; height: 46px; }}
    #p02-typing {{ position: absolute; left: 26px; padding: 26px 30px; border-radius: 30px; background: #FFFFFF; display: flex; gap: 12px; opacity: 0; }}
    #p02-typing i {{ width: 16px; height: 16px; border-radius: 50%; background: #B9A8A0; }}''',
    f'''<div id="p02-bg" class="clip" data-start="0" data-duration="11" data-track-index="0"></div>
    {awning("p02")}
    {step("p02-s1", 1, "Elige tamaño y cantidad")}
    {step("p02-s2", 2, "Nos escribes por WhatsApp")}
    {step("p02-s3", 3, "Te confirmamos")}
    <div id="p02-phone" data-layout-allow-overflow>
      <div id="p02-web">
        <div id="p02-view" data-layout-allow-overflow>
          <div id="p02-plate">
            <img id="p02-plate1" src="assets/plato-1.png" alt="La botella de 500 ml en la web, con 1 botella elegida" width="714" height="1796">
            <img id="p02-plate2" src="assets/plato-2.png" alt="La misma tarjeta con 2 botellas elegidas: S/ 6" width="714" height="1796">
            <div id="p02-hl1" class="hl" style="left:-6px;top:{DOS[1] - 52}px;width:460px;height:104px"></div>
            <div id="p02-hl2" class="hl" style="left:-6px;top:{TOTAL_Y - 56}px;width:420px;height:112px"></div>
          </div>
        </div>
        <img id="p02-head" src="assets/encabezado.png" alt="">
      </div>
      <div id="p02-chat">
        <div id="p02-bar"><img src="assets/logo.png" alt=""><div><b>San Luyo</b><small>en línea</small></div></div>
        <div id="p02-out" class="bubble out" style="top:170px">{MSG}<small>9:41 {CHECKS}</small></div>
        <div id="p02-typing" style="top:560px"><i></i><i></i><i></i></div>
        <div id="p02-in" class="bubble in" style="top:560px">¡Hola! Sí tenemos. Te las llevamos mañana. ¿Recojo o delivery?<small>9:42</small></div>
        <div id="p02-out2" class="bubble out" style="top:780px">Delivery, por favor.<small>9:42 {CHECKS}</small></div>
        <div id="p02-input"><div id="p02-field"><span>{MSG}</span></div><div id="p02-send">{SEND_SVG}</div></div>
      </div>
    </div>
    <div id="p02-ring1" class="ring" style="left:{dos_x}px;top:{dos_y}px"></div>
    <div id="p02-ring2" class="ring" style="left:{ped_x}px;top:{ped_y}px"></div>
    <div id="p02-ring3" class="ring" style="left:{PX + PW - 22 - 48}px;top:{H - 70 - 48 + 40}px"></div>''',
    STEP_JS + f'''      const plate = document.getElementById("p02-plate");
      const view = {{ s: {S0} }};
      function apply() {{ plate.style.top = (-view.s) + "px"; }}
      apply();
      // Paso 1 (0.0–4.0s): la web; se baja hasta el selector, se toca "2" y el total cambia a S/ 6
      stepIn("#p02-s1", 0.1);
      tl.fromTo("#p02-phone", {{ y: 140, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }}, 0.0);
      tl.to(view, {{ s: {S1}, duration: 1.3, ease: "power2.inOut", onUpdate: apply }}, 0.7);
      tl.to("#p02-hl1", {{ opacity: 1, duration: 0.25 }}, 1.9);
      tap("#p02-ring1", 2.3);
      tl.to("#p02-plate2", {{ opacity: 1, duration: 0.12 }}, 2.4);
      tl.to("#p02-hl1", {{ opacity: 0, duration: 0.25 }}, 2.6);
      tl.to("#p02-hl2", {{ opacity: 1, duration: 0.25 }}, 2.6);
      tl.to("#p02-hl2", {{ opacity: 0, duration: 0.3 }}, 3.7);
      // Paso 2 (4.0–8.0s): se toca "Pedir 2 botellas", se abre el chat con el mensaje listo y se envía
      stepOut("#p02-s1", 3.85);
      stepIn("#p02-s2", 4.1);
      tap("#p02-ring2", 4.4);
      tl.fromTo("#p02-chat", {{ opacity: 0, x: 120 }}, {{ opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }}, 4.85);
      tl.to("#p02-web", {{ x: -160, opacity: 0, duration: 0.45, ease: "power3.out" }}, 4.85);
      tl.fromTo("#p02-field span", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35 }}, 5.35);
      tap("#p02-ring3", 6.6);
      tl.to("#p02-field span", {{ opacity: 0, duration: 0.15 }}, 6.75);
      tl.set("#p02-field span", {{ display: "none" }}, 6.9);
      tl.fromTo("#p02-out", {{ opacity: 0, y: 160, scale: 0.96 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }}, 6.8);
      // Paso 3 (8.0–11.0s): San Luyo escribe y confirma; la persona elige delivery
      stepOut("#p02-s2", 7.85);
      stepIn("#p02-s3", 8.1);
      tl.fromTo("#p02-typing", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.3 }}, 8.25);
      tl.fromTo("#p02-typing i", {{ y: 0 }}, {{ y: -10, duration: 0.25, ease: "sine.inOut", stagger: 0.1, yoyo: true, repeat: 3 }}, 8.35);
      tl.to("#p02-typing", {{ opacity: 0, duration: 0.15 }}, 9.2);
      tl.fromTo("#p02-in", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }}, 9.25);
      tl.fromTo("#p02-out2", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }}, 10.1);'''))


# ---------------------------------------------------------------- 03 · Pago (3 s)
write("03-pago", comp("03-pago", 3.0, f'''
    #g03-bg {{ position: absolute; inset: 0; background: {CREAM}; }}
    {AWNING_CSS}
    {STEP_CSS}
    #g03-total {{ position: absolute; left: 0; right: 0; top: 330px; text-align: center; font-size: 40px; color: {SOFT}; opacity: 0; }}
    #g03-total b {{ display: block; font-family: "Gloock", serif; font-weight: 400; font-size: 190px; line-height: 1.05; color: {RED}; }}
    .pay {{ position: absolute; left: 190px; width: 700px; height: 150px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 60px; font-weight: 650; opacity: 0; }}
    #g03-yape {{ top: 720px; background: {INK}; color: {CREAM}; }}
    #g03-plin {{ top: 900px; background: #FFFFFF; color: {INK}; border: 4px solid {INK}; }}
    #g03-cash {{ top: 1080px; background: #F1E3DC; color: {INK}; }}''',
    f'''<div id="g03-bg" class="clip" data-start="0" data-duration="3" data-track-index="0"></div>
    {awning("g03")}
    {step("g03-s4", 4, "Pagas como prefieras")}
    <p id="g03-total">Total de tu pedido<b>S/ 6</b></p>
    <div id="g03-yape" class="pay">Yape</div>
    <div id="g03-plin" class="pay">Plin</div>
    <div id="g03-cash" class="pay">Efectivo</div>''',
    STEP_JS + '''      // Escena 1 (0.0–1.0s): el paso 4 y el total del pedido
      stepIn("#g03-s4", 0.05);
      tl.fromTo("#g03-total", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, 0.25);
      // Escena 2 (1.0–3.0s): las tres formas de pago, una por una
      tl.fromTo(".pay", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.22 }, 0.85);'''))


# ---------------------------------------------------------------- 04 · Entrega y cierre (3.4 s)
write("04-entrega", comp("04-entrega", 3.4, f'''
    #e04-bg {{ position: absolute; inset: 0; background: {CREAM}; }}
    {AWNING_CSS}
    {STEP_CSS}
    #e04-photo {{ position: absolute; left: 140px; top: 280px; width: 800px; height: 600px; border-radius: 40px; object-fit: cover; }}
    #e04-text {{ position: absolute; left: 0; right: 0; top: 930px; text-align: center; font-size: 50px; line-height: 1.35; opacity: 0; }}
    #e04-text b {{ font-weight: 700; }}
    #e04-end {{ position: absolute; inset: 0; background: {CREAM}; opacity: 0; }}
    #e04-logo {{ position: absolute; left: 450px; top: 300px; width: 180px; height: 180px; }}
    #e04-cta {{ position: absolute; left: 70px; right: 70px; top: 560px; text-align: center; font-family: "Gloock", serif; font-weight: 400; font-size: 104px; line-height: 1.05; letter-spacing: -0.02em; }}
    #e04-cta-sub {{ position: absolute; left: 0; right: 0; top: 820px; text-align: center; font-size: 44px; color: {SOFT}; }}''',
    f'''<div id="e04-bg" class="clip" data-start="0" data-duration="3.4" data-track-index="0"></div>
    {awning("e04")}
    {step("e04-s5", 5, "Te la llevamos")}
    <img id="e04-photo" src="assets/chicha-mani.jpg" alt="Botella de chicha de maní San Luyo con un vaso servido">
    <p id="e04-text"><b>Recojo o delivery en Ica</b><br>a la hora que acordemos.</p>
    <div id="e04-end" data-layout-allow-occlusion><img id="e04-logo" src="assets/logo.png" alt="Logo de San Luyo"><p id="e04-cta">Pide la tuya<br>desde la web</p><p id="e04-cta-sub">Elige arriba y escríbenos</p></div>''',
    STEP_JS + '''      // Escena 1 (0.0–1.9s): el paso 5 con la botella y cómo llega
      stepIn("#e04-s5", 0.05);
      tl.fromTo("#e04-photo", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0.15);
      tl.fromTo("#e04-text", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.55);
      // Escena 2 (1.9–3.4s): cierre con el logo; queda igual que el inicio para que el bucle empalme
      tl.to("#e04-end", { opacity: 1, duration: 0.45, ease: "power2.inOut" }, 1.9);
      tl.fromTo("#e04-cta", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 2.1);
      tl.fromTo("#e04-cta-sub", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.4);'''))


# ---------------------------------------------------------------- Barra de progreso (los 5 pasos)
STEPS_T = [2.6, 6.6, 10.6, 13.6, 16.6]
END_T = 18.5
SEG_W, GAP = 100, 16
x0 = (W - (5 * SEG_W + 4 * GAP)) // 2
segs = "".join(f'<i id="pg-{i}" style="left:{x0 + i * (SEG_W + GAP)}px"><u id="pg-f{i}"></u></i>' for i in range(5))
write("05-progreso", comp("05-progreso", 20.0, f'''
    #pg {{ position: absolute; left: 0; top: 52px; width: {W}px; height: 14px; opacity: 0; }}
    #pg i {{ position: absolute; top: 0; width: {SEG_W}px; height: 12px; border-radius: 6px; background: rgba(43, 27, 24, 0.14); overflow: hidden; }}
    #pg u {{ position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: {RED}; transform-origin: 0 50%; }}''',
    f'<div id="pg">{segs}</div>',
    f'''      // La barra aparece con el paso 1 y cada tramo se llena mientras dura su paso
      tl.fromTo("#pg", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {STEPS_T[0]});
      tl.set("#pg u", {{ scaleX: 0 }}, 0);
      const ends = {STEPS_T[1:] + [END_T]};
      const starts = {STEPS_T};
      starts.forEach((t, i) => tl.to("#pg-f" + i, {{ scaleX: 1, duration: ends[i] - t, ease: "none" }}, t));
      tl.to("#pg", {{ opacity: 0, duration: 0.4 }}, {END_T});'''))


# ---------------------------------------------------------------- index.html
SCENES = [("01-titulo", 0, 2.6), ("02-telefono", 2.6, 11.0), ("03-pago", 13.6, 3.0), ("04-entrega", 16.6, 3.4)]
els = "\n".join(f'''      <div id="el-{fid}" class="scene" data-composition-id="{fid}" data-composition-src="compositions/frames/{fid}.html" data-start="{st}" data-duration="{d}" data-track-index="{i % 2}"></div>''' for i, (fid, st, d) in enumerate(SCENES))
open(f"{ROOT}/index.html", "w").write(f'''<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; background: {CREAM}; }}
      .scene {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="20" data-width="{W}" data-height="{H}">
{els}
      <div id="el-05-progreso" class="scene" data-composition-id="05-progreso" data-composition-src="compositions/frames/05-progreso.html" data-start="0" data-duration="20" data-track-index="5"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
      // Cortes: fundidos cortos; el teléfono sube desde abajo al entrar
      tl.to("#el-01-titulo", {{ opacity: 0, duration: 0.35, ease: "power2.inOut" }}, 2.45);
      tl.to("#el-02-telefono", {{ opacity: 0, duration: 0.35, ease: "power2.inOut" }}, 13.45);
      tl.fromTo("#el-03-pago", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35, ease: "power2.inOut" }}, 13.6);
      tl.to("#el-03-pago", {{ opacity: 0, duration: 0.35, ease: "power2.inOut" }}, 16.45);
      tl.fromTo("#el-04-entrega", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35, ease: "power2.inOut" }}, 16.6);
      tl.to({{}}, {{ duration: 20 }}, 0); // ancla: la línea de tiempo dura los 20 s completos
    </script>
  </body>
</html>
''')
print("ok")
