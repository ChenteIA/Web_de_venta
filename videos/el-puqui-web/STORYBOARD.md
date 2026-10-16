---
format: 1080x1920
duration: 30s
message: "Pedir en El Puqui es así de fácil: eliges en la web y el mensaje ya va escrito"
arc: Hook → La carta (tour) → Cómo pedir → Toca y se abre WhatsApp → CTA
audience: Clientes de El Puqui en Ica que piden desde el celular
mode: autonomous
music: none
captions: skipped (sin narración; la web y las etiquetas cuentan la historia)
---

## Video direction

- **Palette (frame.md, igual que el video "El chat"):** lienzo `cream` #FAF4F1 · tinta `ink` #2B1B18 · `pink` #A61D27 rojo manzana (acento) · `pink-deep` #2E6B3B verde hoja (acción, burbujas del cliente) · `green` #631117 granate (etiquetas de paso, cabecera del chat, cierre).
- **Tipografía:** display Gloock 400; body/label Figtree.
- **La web es la protagonista:** capturas reales en vista de celular (show-it-as-is); el lienzo 1080×1920 ES la pantalla del teléfono. El encabezado de la web queda fijo arriba durante el scroll y el botón flotante de WhatsApp abajo a la derecha, como en el celular. No se reconstruye la web en HTML.
- **Etiquetas de paso:** píldoras granate con número ("1 · Elige en la carta"), centradas en la zona media-baja, una por escena.
- **Motion grammar:** scroll suave (power2.inOut) sobre la captura; el toque se marca con un anillo que se expande; curvas de cola larga, nada de rebote.
- **Lista negativa:** no reconstruir la web; nada de slideshow congelado ni elementos flotando sin motivo; sin degradados morados, sin interfaz ni logo real de WhatsApp (chat con el estilo propio del video "El chat").

## Frame 1 — Desde tu celular

- scene: Titular "Pide en El Puqui desde tu celular." sobre crema y etiqueta "Así se ve nuestra web"
- voiceover: ""
- duration: 3s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Friction reduction
- beat: curiosity
- blueprint: kinetic-type-beats (Adapt)
- asset_candidates: assets/logo.png — logo de El Puqui
- focal: assets/logo.png
- roles: logo = supporting (sello pequeño arriba)

narrativeRole: prometer que pedir es fácil y anunciar el recorrido.
keyMessage: tu pedido, desde el celular.

Adapt: titular por palabras de kinetic-type-beats; el logo marca la marca arriba.
Scene 1 (0.0–1.5s): logo pequeño arriba al centro; "Pide en" / "El Puqui" (rojo) / "desde tu" / "celular." entra palabra por palabra en display grande, centrado en el tercio superior-medio.
Scene 2 (1.5–3.0s): bajo el titular aparece la etiqueta "Así se ve nuestra web" con una flecha hacia abajo; lectura quieta.

## Frame 2 — La carta

- scene: La portada de la web en el celular y un scroll suave por la carta de 6 productos
- voiceover: ""
- duration: 9s
- transition_in: push-slide UP
- status: animated
- src: compositions/frames/02-carta.html
- type: product_intro
- persuasion: Show-don't-tell proof
- beat: aspiration
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/page-full.jpg — la web completa en vista de celular; assets/header.png — encabezado fijo; assets/fab.png — botón flotante de WhatsApp
- focal: assets/page-full.jpg
- roles: page-full = background (la pantalla, a sangre) · header = supporting (fijo arriba) · fab = supporting (fijo abajo a la derecha)
- handoff_out: página — scroll 10900 px de la captura, quieta al corte

narrativeRole: mostrar la web tal cual y todo lo que se puede pedir.
keyMessage: toda la carta, con fotos y precios.

Adapt: la superficie es la pantalla completa (variante floating-window push-scroll sin marco); el scroll recorre la página real.
Scene 1 (0.0–1.4s): la portada quieta (scroll 0): titular de la web, botones y foto de los frascos.
Scene 2 (1.4–3.2s): scroll suave hasta "La carta" (el encabezado queda fijo arriba); a 2.4s aparece la etiqueta "1 · Elige en la carta".
Scene 3 (3.2–9.0s): scroll continuo por los 6 productos (manzana, fresa, aguaymanto, duraznos, encurtido, caja de regalo), ~1 s por producto, hasta que asoma "Cómo pedir".

## Frame 3 — Cómo pedir

- scene: Scroll hasta "Cómo pedir" con sus tres pasos
- voiceover: ""
- duration: 5.5s
- transition_in: cut
- status: animated
- src: compositions/frames/03-como-pedir.html
- type: key_feature
- persuasion: Friction reduction
- beat: clarity
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/page-full.jpg — la web completa; assets/header.png — encabezado fijo; assets/fab.png — botón flotante
- focal: assets/page-full.jpg
- roles: page-full = background · header = supporting · fab = supporting
- handoff_in: página — scroll 10900 px, quieta

narrativeRole: explicar el proceso en tres pasos con la propia web.
keyMessage: eliges, confirmamos, te lo llevamos.

Scene 1 (0.0–1.2s): el scroll sigue desde el corte y se asienta con "Cómo pedir" bajo el encabezado.
Scene 2 (1.2–5.5s): etiqueta "2 · Así de simple" (1.4s); scroll muy lento por los pasos 1, 2 y 3; quieta al final.

## Frame 4 — Toca y se abre WhatsApp

- scene: La tarjeta de Mermelada de fresa; un toque en "Pedir por WhatsApp" abre el chat con el mensaje ya escrito, se envía y El Puqui responde
- voiceover: ""
- duration: 8s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-whatsapp.html
- type: key_feature
- persuasion: Show-don't-tell proof
- beat: ease + control
- blueprint: cursor-ui-demo (Adapt)
- asset_candidates: assets/page-full.jpg — la web completa (tarjeta de fresa); assets/header.png — encabezado fijo; assets/fab.png — botón flotante; assets/logo.png — avatar del chat
- focal: assets/page-full.jpg
- roles: page-full = background (tarjeta de fresa) · header/fab = supporting · logo = supporting (avatar del chat)

narrativeRole: probar que el botón deja el pedido escrito; el cliente solo envía.
keyMessage: el mensaje ya va escrito.

Adapt: sin cursor; el toque se marca con un anillo (pantalla táctil). La pantalla cambia de la web al chat.
Scene 1 (0.0–1.4s): la web en la tarjeta de "Mermelada de fresa" (foto, precio S/ 15, botón); etiqueta "3 · Toca y pide" (0.4s).
Scene 2 (1.4–2.0s): un anillo se expande sobre "Pedir por WhatsApp" y el botón se presiona (sonido de toque).
Scene 3 (2.0–4.4s): el chat de El Puqui sube y cubre la pantalla; en la barra de escribir ya está el mensaje: "Hola El Puqui, quiero pedir: Mermelada de fresa (S/ 15). ¿Para qué fecha lo tienen disponible?"; una etiqueta "Ya va escrito" lo señala.
Scene 4 (4.4–8.0s): se presiona enviar (sonido) y el mensaje salta al hilo; "escribiendo…" y llega "¡Claro! Lo tenemos para mañana. ¿Recojo o delivery?" (sonido); quieta.

## Frame 5 — Pide hoy

- scene: Foto vertical de los frascos, logo, "El Puqui", datos del servicio y botón que pasa al número
- voiceover: ""
- duration: 4.5s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/05-cta.html
- type: cta
- persuasion: Friction reduction
- beat: urgency-to-act
- blueprint: cta-morph-press (Adapt)
- asset_candidates: assets/portada.jpg — frascos abajo, pared oscura arriba (vertical); assets/logo.png — logo
- focal: assets/logo.png
- roles: portada = background (oscurecida ~45 %) · logo = cutout

narrativeRole: convertir el recorrido en un pedido ahora.
keyMessage: pide hoy por WhatsApp.

Adapt: se mantiene la presión del botón que cambia de estado.
Scene 1 (0.0–1.2s): la foto entra en foco; logo, "El Puqui" y "Atendemos 24/7 · Delivery en Ica" sobre la pared.
Scene 2 (1.2–2.8s): botón verde "Pedir por WhatsApp"; a 2.0s se presiona y pasa a "+51 900 000 000".
Scene 3 (2.8–4.5s): pie "Demo de ChenteIA · negocio ficticio"; fundido de salida en los últimos 0.4s.
