---
format: 1080x1920
duration: 30s
message: "La preventa de San Luyo está abierta: elige tus botellas en la web y separa por WhatsApp"
arc: Gancho → La entrada → El producto (elige botellas) → Cómo pedir → Cierre
audience: Clientes de Ica que siguen negocios locales en Instagram, Facebook y estados de WhatsApp
mode: collaborative
music: none
music_note: "música propia compuesta localmente (source: host): instrumental alegre a ~100 BPM, guitarra punteada y cajón suave, en assets/musica.mp3"
captions: skipped (sin narración; la web y las etiquetas cuentan la historia)
---

## Video direction

- **Palette (frame.md, la misma de la web):** lienzo `cream` #FAF4F1 · tinta `ink` #2B1B18 · `pink` #A61D27 rojo de la marca (franja de toldo, precio) · `pink-deep` #2E6B3B verde de WhatsApp (acción) · café oscuro #2B1B18 del contacto.
- **Tipografía:** display Gloock 400; texto y etiquetas Figtree (en minúscula normal, sin mayúsculas espaciadas).
- **La web es la protagonista:** capturas reales en vista de celular (show-it-as-is); el lienzo 1080×1920 ES la pantalla del teléfono. El encabezado de la web queda fijo arriba durante el scroll y el botón flotante de WhatsApp abajo a la derecha. No se reconstruye la web en HTML.
- **Etiquetas de sección:** una píldora café oscuro con texto crema por escena ("La entrada", "Elige tus botellas", "Así de simple"), en la zona media-baja.
- **Música:** pista instrumental propia de 30 s, alegre y suave; sube al inicio, baja un poco bajo los toques y cierra con un final limpio. Toques y "enviado" como efectos encima.
- **Motion grammar:** scroll suave (power2.inOut) sobre la captura; el toque se marca con un anillo que se expande; cortes al ritmo de la música (100 BPM, un compás = 2,4 s).
- **Lista negativa:** no reconstruir la web; nada de slideshow congelado; sin degradados morados ni interfaz o logo real de WhatsApp; sin contenido importante en el 10 % de cada borde.

## Frame 1 — Gancho

- scene: Huacachina al atardecer, oscurecida; el logo SL y "Chicha de maní, hecha en Ica." entran palabra por palabra; debajo "Ya puedes separarla desde la web."
- voiceover: ""
- duration: 3s
- transition_in: cut
- status: animated
- src: compositions/frames/01-gancho.html
- type: hook
- persuasion: Curiosity gap
- beat: curiosity
- blueprint: kinetic-type-beats (Adapt)
- asset_candidates: assets/cierre-ica.jpg — el oasis de Huacachina; assets/logo.png — logo SL
- focal: assets/logo.png
- roles: cierre-ica = background (oscurecida ~50 %, leve zoom lento) · logo = supporting (sello arriba)

narrativeRole: detener el scroll con el lugar y el producto.
keyMessage: chicha de maní de Ica, ahora en la web.

Scene 1 (0.0–1.6s): la foto entra con un zoom lento; el logo SL aparece arriba al centro; el titular entra por palabras.
Scene 2 (1.6–3.0s): aparece "Ya puedes separarla desde la web." con una flecha hacia abajo; lectura quieta.

## Frame 2 — La entrada

- scene: La web en el celular, arriba del todo: foto de las botellas, franja de toldo, logo, titular, frase de preventa y botón "Separar mi botella"
- voiceover: ""
- duration: 6s
- transition_in: push-slide UP
- status: animated
- src: compositions/frames/02-entrada.html
- type: product_intro
- persuasion: Show-don't-tell proof
- beat: aspiration
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/page-full.jpg — la web completa en vista de celular; assets/header.png — encabezado fijo; assets/fab.png — botón flotante
- focal: assets/page-full.jpg
- roles: page-full = background (la pantalla, a sangre) · header = supporting (fijo arriba) · fab = supporting (fijo abajo a la derecha)
- handoff_out: página — quieta en la tarjeta de entrada al corte

narrativeRole: mostrar la web tal cual y anunciar la preventa.
keyMessage: preventa abierta, entregas desde el lunes 19.

Scene 1 (0.0–2.0s): la portada quieta (scroll 0): foto de las botellas y el comienzo de la tarjeta.
Scene 2 (2.0–4.0s): scroll suave hasta centrar la tarjeta; etiqueta "La entrada" (2.4s).
Scene 3 (4.0–6.0s): un subrayado rojo se dibuja bajo "Preventa abierta" y el botón "Separar mi botella" late una vez.

## Frame 3 — El producto

- scene: Scroll a "Chicha de maní" (foto, S/ 5 la botella de 500 ml); un toque en "6" cambia el total a S/ 30 y el botón a "Separar 6 botellas"; un toque en el botón y sale el mensaje de WhatsApp ya escrito
- voiceover: ""
- duration: 8s
- transition_in: cut
- status: animated
- src: compositions/frames/03-producto.html
- type: key_feature
- persuasion: Show-don't-tell proof
- beat: ease + control
- blueprint: cursor-ui-demo (Adapt)
- asset_candidates: assets/page-full.jpg — la web (sección de la chicha); assets/picker-1.png, assets/picker-6.png — el selector con 1 y con 6 botellas; assets/header.png; assets/fab.png
- focal: assets/page-full.jpg
- roles: page-full = background · picker-6 = supporting (cambia en su lugar sobre el selector) · header/fab = supporting

narrativeRole: probar que pedir es elegir y tocar; el total y el mensaje salen solos.
keyMessage: eliges cuántas botellas y el pedido ya va escrito.

Adapt: sin cursor; el toque se marca con un anillo (pantalla táctil).
Scene 1 (0.0–2.0s): scroll desde la entrada hasta la foto y el título "Chicha de maní" con S/ 5; etiqueta "Elige tus botellas" (1.2s).
Scene 2 (2.0–4.4s): scroll corto al selector; anillo de toque sobre "6" (2.8s, sonido de toque); el selector cambia en su lugar: "S/ 30 por 6 botellas" y "Separar 6 botellas".
Scene 3 (4.4–8.0s): anillo de toque sobre "Separar 6 botellas" (4.8s); sube una burbuja verde con el mensaje real: "Hola San Luyo, quiero separar 6 botellas de chicha de maní (500 ml, S/ 5 c/u = S/ 30) para recibirlas desde el lunes 19 de octubre." (sonido de enviado, 5.6s); quieta.

## Frame 4 — Cómo pedir

- scene: Scroll hasta "Cómo pedir" y su nota impresa con borde de corte: Hoy / Al confirmar / Desde el lunes 19 de octubre, y la barra final "Tu chicha, bien helada · desde el lunes 19"
- voiceover: ""
- duration: 7s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-como-pedir.html
- type: key_feature
- persuasion: Friction reduction
- beat: clarity
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/page-full.jpg — la web (sección Cómo pedir); assets/header.png; assets/fab.png
- focal: assets/page-full.jpg
- roles: page-full = background · header = supporting · fab = supporting

narrativeRole: explicar el proceso con la propia web.
keyMessage: separas hoy, confirmamos y desde el lunes 19 te la llevamos.

Scene 1 (0.0–1.6s): scroll hasta el título "Cómo pedir"; etiqueta "Así de simple" (0.8s).
Scene 2 (1.6–5.6s): scroll lento por la nota; cada grupo (Hoy, Al confirmar, Desde el lunes 19) se resalta con un fondo crema suave al pasar.
Scene 3 (5.6–7.0s): la barra "Tu chicha, bien helada · desde el lunes 19" queda centrada; quieta.

## Frame 5 — Cierre

- scene: El contacto de la web (número gigante y "Abrir WhatsApp") y luego el pie con Huacachina: logo, "San Luyo", "Preventa · Entregas desde el lunes 19" y el número
- voiceover: ""
- duration: 6s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/05-cierre.html
- type: cta
- persuasion: Friction reduction
- beat: urgency-to-act
- blueprint: cta-morph-press (Adapt)
- asset_candidates: assets/page-full.jpg — la web (contacto); assets/cierre-ica.jpg — Huacachina; assets/logo.png — logo SL
- focal: assets/logo.png
- roles: page-full = background (escena 1) · cierre-ica = background (escena 2, oscurecida) · logo = cutout

narrativeRole: convertir el recorrido en un pedido ahora.
keyMessage: separa tu botella por WhatsApp.

Scene 1 (0.0–2.4s): la web en el contacto: "Escríbenos por WhatsApp" y el número gigante; anillo de toque sobre "Abrir WhatsApp" (1.4s).
Scene 2 (2.4–6.0s): fundido a Huacachina oscurecida: logo SL, "San Luyo" grande, "Preventa · Entregas desde el lunes 19" y el botón verde con "+51 910 897 377"; la música cierra; fundido de salida en los últimos 0.4s.
