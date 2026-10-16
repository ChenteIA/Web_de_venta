# Construye las escenas animadas del video "San Luyo · recorrido por la web" (HyperFrames, 1080x1920),
# sobre los bocetos aprobados (mismos encuadres que gen_sl.py en modo sketch).
import os
ROOT = "/home/user/Web_de_venta/videos/san-luyo-web"
WA = open("/tmp/claude-0/-home-user-Web-de-venta/e05da7f4-15c7-5b7f-874f-dc809e5a237a/scratchpad/wa.svg").read().strip()
WA_SVG = '<svg viewBox="0 0 361 362" aria-hidden="true">' + WA + '</svg>'

FONTS = '''@font-face { font-family: "Gloock"; src: url("assets/fonts/gloock-latin.woff2") format("woff2"); font-weight: 400; }
    @font-face { font-family: "Figtree"; src: url("assets/fonts/figtree-latin.woff2") format("woff2"); font-weight: 300 900; }'''
CHIP_CSS = '''.chip { position: absolute; left: 540px; top: 236px; padding: 22px 46px; border-radius: 999px; background: #2B1B18; color: #FAF4F1; font-size: 46px; font-weight: 560; white-space: nowrap; opacity: 0; }
    .ring { position: absolute; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; background: rgba(250, 244, 241, 0.35); border: 7px solid #2B1B18; opacity: 0; }'''
PAGE_H = 11490
HEAD_H = 192

def web_layer(p, scroll, extra=""):
    return f'''<div id="{p}-page" class="page" style="transform: translateY({-scroll}px)"><img src="assets/page-full.jpg" alt="La web de San Luyo en el celular" width="1080" height="{PAGE_H}">{extra}</div>
    <img id="{p}-head" class="head" src="assets/header.png" alt="">
    <img id="{p}-fab" class="fab" src="assets/fab.png" alt="">'''

WEB_CSS = f'''.page {{ position: absolute; left: 0; top: 0; width: 1080px; height: {PAGE_H}px; }}
    .page > img {{ display: block; width: 1080px; height: {PAGE_H}px; }}
    .head {{ position: absolute; left: 0; top: 0; width: 1080px; height: {HEAD_H}px; }}
    .fab {{ position: absolute; left: 864px; top: 1704px; width: 168px; height: 168px; border-radius: 50%; }}'''

# Scroll de la página: un objeto proxy que mueve la captura (el encabezado y el botón quedan fijos).
def scroller(p, s0):
    return f'''      const page = document.getElementById("{p}-page");
      const view = {{ s: {s0} }};
      function apply() {{ page.style.transform = "translateY(" + (-view.s) + "px)"; }}
      apply();
      function scrollTo(target, t, dur, ease) {{ tl.to(view, {{ s: target, duration: dur, ease: ease || "power2.inOut", onUpdate: apply }}, t); }}
      function chip(sel, tin, tout) {{
        tl.fromTo(sel, {{ opacity: 0, y: 24, xPercent: -50 }}, {{ opacity: 1, y: 0, xPercent: -50, duration: 0.45, ease: "power3.out" }}, tin);
        tl.to(sel, {{ opacity: 0, y: -12, xPercent: -50, duration: 0.35, ease: "power2.in" }}, tout);
      }}
      function tap(sel, t) {{
        tl.fromTo(sel, {{ opacity: 0.95, scale: 0.4 }}, {{ opacity: 0, scale: 1.7, duration: 0.55, ease: "power2.out", immediateRender: false }}, t);
      }}
'''

def comp(fid, dur, css, body, script):
    return f'''<template>
  <script src="assets/vendor/gsap.min.js"></script>
  <style>
    {FONTS}
    #root {{ position: absolute; inset: 0; width: 1080px; height: 1920px; overflow: hidden; color: #2B1B18; font-family: "Figtree", sans-serif; }}
    {css}
  </style>
  <div id="root" data-composition-id="{fid}" data-width="1080" data-height="1920" data-duration="{dur}">
    {body}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{script}
      tl.to({{}}, {{ duration: 0.01 }}, {dur - 0.01});
      window.__timelines = window.__timelines || {{}};
      window.__timelines["{fid}"] = tl;
    }})();
  </script>
</template>
'''

def write(fid, html):
    open(f"{ROOT}/compositions/frames/{fid}.html", "w").write(html)

# ---------- 01 Gancho (3 s) ----------
write("01-gancho", comp("01-gancho", 3.0, '''
    #g01-bg { position: absolute; inset: 0; background: #1d130f; }
    #g01-photo { position: absolute; inset: 0; width: 1080px; height: 1920px; object-fit: cover; object-position: 50% 100%; filter: brightness(0.82); transform-origin: 50% 80%; }
    #g01-logo { position: absolute; left: 450px; top: 250px; width: 180px; height: 180px; }
    #g01-title { position: absolute; left: 60px; right: 60px; top: 470px; text-align: center; font-family: "Gloock", serif; font-weight: 400; font-size: 112px; line-height: 1.0; letter-spacing: -0.02em; color: #FAF4F1; }
    #g01-title span { display: block; }
    #g01-sub { position: absolute; left: 90px; right: 90px; top: 740px; text-align: center; font-size: 50px; line-height: 1.3; color: #F3E6DE; opacity: 0; }
    #g01-arrow { position: absolute; left: 510px; top: 840px; width: 60px; height: 60px; opacity: 0; }''',
    '''<div id="g01-bg" class="clip" data-start="0" data-duration="3" data-track-index="0"></div>
    <img id="g01-photo" src="assets/portada.jpg" alt="Dos botellas y un vaso de chicha de maní con maníes">
    <img id="g01-logo" src="assets/logo.png" alt="Logo de San Luyo">
    <h1 id="g01-title"><span>Chicha de maní,</span><span>hecha en Ica.</span></h1>
    <p id="g01-sub">Ya puedes separarla desde la web.</p>
    <svg id="g01-arrow" viewBox="0 0 24 24" fill="none" stroke="#FAF4F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16M5 13l7 7 7-7"/></svg>''',
    '''      // Escena 1 (0.0–1.6s): la foto se acerca despacio; logo y titular entran
      tl.fromTo("#g01-photo", { scale: 1.08 }, { scale: 1, duration: 3, ease: "power1.out" }, 0);
      tl.fromTo("#g01-logo", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0.1);
      tl.fromTo("#g01-title span", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.18 }, 0.3);
      // Escena 2 (1.6–3.0s): la invitación y la flecha
      tl.fromTo("#g01-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 1.25);
      tl.fromTo("#g01-arrow", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1.6);
      tl.to("#g01-arrow", { y: 12, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.05);'''))

# ---------- 02 Entrada (6 s) ----------
S2 = 519
write("02-entrada", comp("02-entrada", 6.0, WEB_CSS + "\n    " + CHIP_CSS + '''
    #e02-bg { position: absolute; inset: 0; background: #FFFFFF; }
    #e02-mark { position: absolute; left: 240px; top: 1300px; width: 600px; height: 10px; border-radius: 5px; background: #A61D27; transform-origin: 0 50%; }
    #e02-pulse { position: absolute; left: 228px; top: 1338px; width: 624px; height: 144px; border-radius: 999px; border: 8px solid #2E6B3B; opacity: 0; }''',
    '<div id="e02-bg" class="clip" data-start="0" data-duration="6" data-track-index="0"></div>\n    ' + web_layer("e02", 0) + '''
    <div id="e02-mark"></div>
    <div id="e02-pulse"></div>
    <div id="e02-chip" class="chip">La entrada</div>''',
    scroller("e02", 0) + f'''      // Escena 1 (0.0–2.0s): la portada quieta, arriba del todo
      // Escena 2 (2.0–4.0s): scroll suave hasta centrar la tarjeta de entrada
      scrollTo({S2}, 1.6, 1.8, "power2.inOut");
      chip("#e02-chip", 2.4, 5.3);
      // Escena 3 (4.0–6.0s): subrayado de la preventa y el botón late
      tl.fromTo("#e02-mark", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.6, ease: "power3.out" }}, 3.7);
      tl.to("#e02-mark", {{ opacity: 0, duration: 0.3, ease: "power2.in" }}, 5.65);
      tl.fromTo("#e02-pulse", {{ opacity: 0.9, scale: 1 }}, {{ opacity: 0, scale: 1.12, duration: 0.55, ease: "power2.out", immediateRender: false }}, 4.5);
      tl.fromTo("#e02-pulse", {{ opacity: 0.9, scale: 1 }}, {{ opacity: 0, scale: 1.12, duration: 0.7, ease: "power2.out", immediateRender: false }}, 5.1);'''))

# ---------- 03 Producto (8 s) ----------
S3 = 3020
write("03-producto", comp("03-producto", 8.0, WEB_CSS + "\n    " + CHIP_CSS + f'''
    #p03-bg {{ position: absolute; inset: 0; background: #FFFFFF; }}
    #p03-picker6 {{ position: absolute; left: 48px; top: 4176px; width: 984px; height: 762px; opacity: 0; }}
    #p03-ring1 {{ left: 484px; top: 1222px; }}
    #p03-ring2 {{ left: 540px; top: 1624px; }}
    #p03-sheet {{ position: absolute; left: 0; right: 0; bottom: 0; height: 900px; background: #EFE6DD; border-radius: 40px 40px 0 0; overflow: hidden; }}
    #p03-bar {{ display: flex; align-items: center; gap: 24px; height: 150px; padding: 0 48px; background: #2B1B18; color: #FAF4F1; }}
    #p03-bar img {{ width: 92px; height: 92px; }}
    #p03-bar b {{ display: block; font-size: 44px; font-weight: 600; }}
    #p03-bar small {{ display: block; font-size: 30px; color: #D9C9C2; }}
    #p03-bubble {{ position: absolute; right: 48px; top: 220px; width: 800px; padding: 34px 38px 26px; border-radius: 36px 36px 8px 36px; background: #2E6B3B; color: #FFFFFF; font-size: 40px; line-height: 1.38; opacity: 0; transform-origin: 100% 100%; }}
    #p03-bubble time {{ display: block; margin-top: 10px; text-align: right; font-size: 28px; color: #CFE6D4; }}
    #p03-note {{ position: absolute; left: 48px; right: 48px; bottom: 70px; text-align: center; font-size: 40px; color: #2B1B18; opacity: 0; }}''',
    '<div id="p03-bg" class="clip" data-start="0" data-duration="8" data-track-index="0"></div>\n    ' + web_layer("p03", S2, '<img id="p03-picker6" src="assets/picker-6.png" alt="Selector con 6 botellas: S/ 30">') + f'''
    <div id="p03-ring1" class="ring"></div>
    <div id="p03-ring2" class="ring"></div>
    <div id="p03-chip" class="chip">Elige tus botellas</div>
    <div id="p03-sheet">
      <div id="p03-bar"><img src="assets/logo.png" alt=""><div><b>San Luyo</b><small>+51 910 897 377</small></div></div>
      <p id="p03-bubble">Hola San Luyo, quiero separar 6 botellas de chicha de maní (500 ml, S/ 5 c/u = S/ 30) para recibirlas desde el lunes 19 de octubre.<time>enviado</time></p>
      <p id="p03-note">El mensaje ya va escrito: solo lo envías.</p>
    </div>''',
    scroller("p03", S2) + f'''      // Escena 1 (0.0–2.0s): de la entrada a "Chicha de maní · S/ 5"
      scrollTo({S3}, 0.0, 2.0, "power2.inOut");
      chip("#p03-chip", 1.2, 3.5);
      // Escena 2 (2.0–4.4s): toque en "6": el selector cambia a S/ 30 y "Separar 6 botellas"
      tap("#p03-ring1", 2.8);
      tl.to("#p03-picker6", {{ opacity: 1, duration: 0.14, ease: "none" }}, 2.95);
      // Escena 3 (4.4–8.0s): toque en "Separar 6 botellas" y sube el chat con el mensaje escrito
      tap("#p03-ring2", 4.8);
      tl.fromTo("#p03-sheet", {{ y: 960 }}, {{ y: 0, duration: 0.6, ease: "power3.out" }}, 5.0);
      tl.fromTo("#p03-bubble", {{ opacity: 0, scale: 0.94, y: 24 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }}, 5.6);
      tl.fromTo("#p03-note", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }}, 6.3);'''))

# ---------- 04 Cómo pedir (7 s) ----------
S4a, S4b, S4c = 4790, 5340, 5420
HL = [("c04-h1", 1907 * 3 - 24, (2025 - 1907) * 3 + 48), ("c04-h2", 2051 * 3 - 24, (2169 - 2051) * 3 + 48), ("c04-h3", 2195 * 3 - 24, (2281 - 2195) * 3 + 48)]
hl_html = "".join(f'<div id="{i}" class="hl" style="top: {y}px; height: {h}px"></div>' for i, y, h in HL)
write("04-como-pedir", comp("04-como-pedir", 7.0, WEB_CSS + "\n    " + CHIP_CSS + '''
    #c04-bg { position: absolute; inset: 0; background: #FFFFFF; }
    .hl { position: absolute; left: 108px; width: 864px; border-radius: 20px; background: rgba(226, 168, 75, 0.24); opacity: 0; }''',
    '<div id="c04-bg" class="clip" data-start="0" data-duration="7" data-track-index="0"></div>\n    ' + web_layer("c04", S4a, hl_html) + '''
    <div id="c04-chip" class="chip">Así de simple</div>''',
    scroller("c04", S4a) + f'''      // Escena 1 (0.0–1.6s): el título "Cómo pedir"
      chip("#c04-chip", 0.6, 2.2);
      // Escena 2 (1.6–5.6s): scroll lento por la nota; cada paso se resalta al pasar
      scrollTo({S4b}, 1.4, 1.6, "power2.inOut");
      scrollTo({S4c}, 3.0, 2.6, "sine.inOut");
      tl.to("#c04-h1", {{ opacity: 1, duration: 0.3 }}, 2.0);
      tl.to("#c04-h1", {{ opacity: 0, duration: 0.3 }}, 3.0);
      tl.to("#c04-h2", {{ opacity: 1, duration: 0.3 }}, 3.0);
      tl.to("#c04-h2", {{ opacity: 0, duration: 0.3 }}, 4.1);
      tl.to("#c04-h3", {{ opacity: 1, duration: 0.3 }}, 4.1);
      // Escena 3 (5.6–7.0s): la barra final queda a la vista; el botón flotante se aparta
      tl.to("#c04-fab", {{ opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in" }}, 4.6);'''))

# ---------- 05 Cierre (6 s) ----------
S5a, S5b = 8090, 8196
write("05-cierre", comp("05-cierre", 6.0, WEB_CSS + "\n    " + CHIP_CSS + '''
    #f05-bg { position: absolute; inset: 0; background: #2B1B18; }
    #f05-ring { left: 294px; top: 1086px; }
    #f05-end { position: absolute; inset: 0; opacity: 0; background: #1d130f; }
    #f05-photo { position: absolute; inset: 0; width: 1080px; height: 1920px; object-fit: cover; object-position: 44% 50%; filter: brightness(0.5); }
    #f05-logo { position: absolute; left: 430px; top: 330px; width: 220px; height: 220px; }
    #f05-name { position: absolute; left: 0; right: 0; top: 600px; text-align: center; font-family: "Gloock", serif; font-weight: 400; font-size: 200px; line-height: 1; letter-spacing: -0.03em; color: #FAF4F1; }
    #f05-tag { position: absolute; left: 108px; right: 108px; top: 860px; text-align: center; font-size: 52px; line-height: 1.3; color: #FAF4F1; }
    #f05-tag b { color: #E8B45E; font-weight: 600; }
    #f05-btn { position: absolute; left: 140px; width: 800px; top: 1130px; height: 140px; border-radius: 999px; background: #2E6B3B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 26px; font-size: 58px; font-weight: 600; font-variant-numeric: tabular-nums; }
    #f05-btn svg { width: 64px; height: 64px; fill: #FFFFFF; }
    #f05-foot { position: absolute; left: 108px; right: 108px; top: 1330px; text-align: center; font-size: 40px; color: #E9DCD6; }
    #f05-out { position: absolute; inset: 0; background: #000; opacity: 0; }''',
    '<div id="f05-bg" class="clip" data-start="0" data-duration="6" data-track-index="0"></div>\n    ' + web_layer("f05", S5a) + '''
    <div id="f05-ring" class="ring"></div>
    <div id="f05-end">
      <img id="f05-photo" src="assets/cierre-ica.jpg" alt="El oasis de Huacachina entre dunas, en Ica">
      <img id="f05-logo" src="assets/logo.png" alt="Logo de San Luyo">
      <p id="f05-name">San Luyo</p>
      <p id="f05-tag"><b>Preventa</b> · Entregas desde el lunes 19 de octubre</p>
      <div id="f05-btn">''' + WA_SVG + '''<span>+51 910 897 377</span></div>
      <p id="f05-foot">Chicha de maní, hecha en Ica.</p>
    </div>
    <div id="f05-out"></div>''',
    scroller("f05", S5a) + f'''      // Escena 1 (0.0–2.4s): el contacto de la web; toque en "Abrir WhatsApp"
      scrollTo({S5b}, 0.0, 1.2, "power2.out");
      tap("#f05-ring", 1.4);
      // Escena 2 (2.4–6.0s): Huacachina con la marca, la preventa y el número
      tl.to("#f05-end", {{ opacity: 1, duration: 0.6, ease: "power2.inOut" }}, 2.3);
      tl.fromTo("#f05-photo", {{ scale: 1.08 }}, {{ scale: 1, duration: 3.7, ease: "power1.out" }}, 2.3);
      tl.fromTo("#f05-logo", {{ opacity: 0, scale: 0.8 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }}, 2.7);
      tl.fromTo("#f05-name", {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }}, 2.85);
      tl.fromTo("#f05-tag", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }}, 3.05);
      tl.fromTo("#f05-btn", {{ opacity: 0, scale: 0.94 }}, {{ opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }}, 3.25);
      tl.fromTo("#f05-foot", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, 3.45);
      tl.to("#f05-out", {{ opacity: 1, duration: 0.4, ease: "power1.in" }}, 5.6);'''))
print("ok")
