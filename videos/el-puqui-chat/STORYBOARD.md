---
format: 1080x1080
duration: 30s
message: "Pedir en El Puqui es tan fácil como mandar un WhatsApp"
arc: Hook → El pedido (valor) → Confirmado (prueba) → La carta → CTA
audience: Clientes de Ica que siguen negocios locales en Instagram/Facebook
mode: autonomous
music: none
captions: skipped (sin narración; el texto del chat cuenta la historia)
---

## Video direction

- **Palette (frame.md, por rol):** lienzo `cream` #FAF4F1 · tinta `ink` #2B1B18 · acento de marca `pink` #A61D27 (rojo manzana: precios, sello, palabra clave) · acción `pink-deep` #2E6B3B (verde hoja: burbujas del cliente, botón de enviar, botón final) · `green` #631117 (granate profundo) para fondos oscuros del cierre · `cream-2` #F3B7BC solo como tinte suave. Ningún color fuera de frame.md.
- **Tipografía:** display = Gloock 400 (titulares, nombre de marca, precios); body/label = Figtree (texto del chat, etiquetas en mayúsculas espaciadas).
- **Chat:** interfaz inspirada en una app de mensajería, sin copiar WhatsApp: burbuja del cliente verde hoja a la derecha con texto crema; burbuja de El Puqui crema/blanca a la izquierda con borde fino; avatar = logo del frasco rojo; cabecera "El Puqui · en línea". Teléfono con marco simple redondeado, sin muesca realista.
- **Motion grammar:** curvas de cola larga (power3), suave antes que rebote; cada mensaje entra cuando "se envía" (pop corto con escala 0.96→1 y leve subida), nunca todo a la vez. Indicador "escribiendo…" con tres puntos antes de cada respuesta de El Puqui.
- **Ritmo:** F1 rápido · F2 y F3 se construyen mensaje a mensaje · F3 termina en un acercamiento sostenido a la confirmación (pausa) · F4 ensambla la carta · F5 cierre quieto y legible.
- **Lista negativa:** nada de slideshow (todo al inicio y luego congelado) ni salvapantallas (todo flotando por su cuenta); sin degradados morados/azules, sin bokeh, sin sombras pesadas, sin logo ni interfaz real de WhatsApp, sin emojis en titulares, sin contenido importante en el 17 % inferior.

## Frame 1 — Un mensaje

- scene: Titular "¿Antojo de algo casero?" y una notificación de El Puqui que cae desde arriba
- voiceover: ""
- duration: 3.5s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Curiosity gap
- beat: curiosity
- blueprint: kinetic-type-beats (Adapt)
- asset_candidates: assets/logo.png — logo de El Puqui (frasco rojo) para el avatar de la notificación
- focal: assets/logo.png
- roles: logo = supporting (avatar dentro de la notificación)

narrativeRole: detener el scroll con un antojo y prometer que la solución llega por mensaje.
keyMessage: lo casero está a un mensaje de distancia.

Adapt: se mantiene el titular por palabras de kinetic-type-beats; se añade la notificación como segundo golpe.
Scene 1 (0.0–1.3s): lienzo crema; "¿Antojo de" / "algo casero?" entra palabra por palabra en display grande, centrado en el tercio superior (~60 % del ancho). Per-word staggered reveal.
Scene 2 (1.3–2.6s): una tarjeta de notificación redondeada cae desde el borde superior y se asienta bajo el titular (centrada, ~78 % del ancho): avatar del logo, "El Puqui · ahora", texto "Escríbenos y te lo llevamos mañana." Slide-down con asentamiento suave. Sonido de notificación.
Scene 3 (2.6–3.5s): todo quieto, lectura sostenida.

## Frame 2 — El pedido

- scene: Un celular con el chat de El Puqui; el cliente escribe su pedido y El Puqui responde con la foto del frasco
- voiceover: ""
- duration: 8s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-pedido.html
- type: product_intro
- persuasion: Show-don't-tell proof
- beat: ease
- blueprint: device-surface-showcase (Adapt)
- asset_candidates: assets/mermelada-fresa.jpg — frasco de mermelada de fresa con tostada; assets/logo.png — avatar del chat
- focal: assets/mermelada-fresa.jpg
- roles: mermelada-fresa = supporting (foto dentro de la burbuja de El Puqui) · logo = supporting (avatar en la cabecera)
- handoff_out: teléfono — x centro 680px, y centro 470px, escala 1, opacidad 1, quieto; hilo de mensajes visible igual que en t=8.0s

narrativeRole: mostrar el valor: pedir es escribir un mensaje normal.
keyMessage: pides como le escribes a un amigo.

Adapt: se mantiene el teléfono como héroe con el flujo paso a paso (variante stepwise-flow); la pantalla es el chat reconstruido.
Scene 1 (0.0–1.0s): el teléfono sube desde abajo y se asienta a la derecha (asimétrico 60/40, teléfono ~46 % del ancho, ~84 % del alto); cabecera "El Puqui · en línea" con avatar. Columna izquierda vacía.
Scene 2 (1.0–3.4s): en la barra de escribir del teléfono se teclea con cursor "Hola El Puqui, quiero pedir: Mermelada de fresa (S/ 15). ¿Para qué fecha la tienen?"; al terminar, el botón verde de enviar se presiona y el texto salta al hilo como burbuja verde a la derecha (pop). Sonido de envío a 3.4s.
Scene 3 (3.4–5.0s): bajo la burbuja aparece "escribiendo…" (tres puntos) del lado de El Puqui. A la vez, en la columna izquierda entra el titular "Pides como le escribes a un amigo." palabra por palabra (display, el mensaje de valor).
Scene 4 (5.0–8.0s): llega la respuesta de El Puqui: primero una burbuja con la foto del frasco de fresa (5.0s, sonido de recibido), luego el texto "¡Claro! La tenemos para mañana. ¿Recojo o delivery?" (6.3s, sonido de recibido). Se sostiene la lectura hasta el final.

## Frame 3 — Confirmado

- scene: El cliente pide delivery y paga con Yape; El Puqui confirma y la cámara se acerca a la confirmación
- voiceover: ""
- duration: 7s
- transition_in: cut
- status: animated
- src: compositions/frames/03-confirmado.html
- type: key_feature
- persuasion: Friction reduction
- beat: relief + control
- blueprint: agent-progress-theater (Adapt)
- asset_candidates: assets/logo.png — avatar del chat
- focal: assets/logo.png
- roles: logo = supporting (avatar en la cabecera)
- handoff_in: teléfono — x centro 680px, y centro 470px, escala 1, opacidad 1, quieto; mismo hilo que al final de Frame 2

narrativeRole: probar que el pedido se cierra en dos mensajes, sin formularios.
keyMessage: en dos mensajes tu pedido está listo.

Adapt: se mantiene el hilo que se construye mensaje a mensaje hasta un acercamiento de cámara sobre la confirmación (firma de la variante conversación); sin loaders.
Scene 1 (0.0–1.6s): el hilo sube un poco para hacer espacio; nueva burbuja verde del cliente "Delivery, porfa. Pago con Yape." (pop + sonido de envío a 0.6s). Titular izquierdo del Frame 2 sigue presente.
Scene 2 (1.6–3.2s): "escribiendo…" de El Puqui; a 2.4s llega "¡Listo! Mañana te lo llevamos a tu casa." (sonido de recibido). El titular izquierdo cambia en su lugar a "Sin formularios. Sin apps." (in-place token cycle).
Scene 3 (3.2–5.0s): la cámara hace zoom hacia la burbuja de confirmación (zoom-to-target); sobre ella se estampa un sello rojo manzana "Pedido confirmado" que gira levemente al asentarse.
Scene 4 (5.0–7.0s): pausa quieta sobre la confirmación y el sello (frame sostenido).

## Frame 4 — La carta

- scene: Las seis fotos de la carta se ensamblan en una cuadrícula con nombre y precio, y una franja con los datos del servicio
- voiceover: ""
- duration: 6.5s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/04-carta.html
- type: benefits
- persuasion: Value stacking
- beat: aspiration
- blueprint: grid-card-assemble (Adapt)
- asset_candidates: assets/mermelada-manzana.jpg — mermelada de manzana; assets/mermelada-fresa.jpg — mermelada de fresa; assets/mermelada-aguaymanto.jpg — mermelada de aguaymanto; assets/duraznos-almibar.jpg — duraznos en almíbar; assets/encurtido.jpg — encurtido de verduras; assets/caja-regalo.jpg — caja de regalo
- focal: assets/caja-regalo.jpg
- roles: las seis fotos = supporting (tarjetas de la cuadrícula; la caja de regalo cierra el ensamblaje)

narrativeRole: mostrar que hay más para pedir y cómo funciona el servicio.
keyMessage: toda la carta artesanal, a un mensaje.

Adapt: se mantiene el ensamblaje escalonado de tarjetas; seis tarjetas 3×2 en vez de una cuadrícula de features.
Scene 1 (0.0–0.8s): titular "Toda la carta, a un mensaje." entra arriba (display, centrado).
Scene 2 (0.8–3.6s): seis tarjetas (foto 4:3 + nombre en body + precio en display rojo) entran una a una en una cuadrícula 3×2 que ocupa ~70 % del lienzo: manzana S/ 14, fresa S/ 15, aguaymanto S/ 16, duraznos S/ 18, encurtido S/ 13, caja de regalo desde S/ 40. Rise con leve escala.
Scene 3 (3.6–6.5s): bajo la cuadrícula, una franja de etiquetas en mayúsculas cambia en su lugar: "Atendemos 24/7" → "Delivery en Ica" → "Yape, Plin o efectivo" (in-place token cycle); la cuadrícula queda quieta.

## Frame 5 — Escríbenos

- scene: Foto de los frascos al fondo, logo y nombre de El Puqui, botón "Pedir por WhatsApp" que se presiona y el número
- voiceover: ""
- duration: 5s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/05-cta.html
- type: cta
- persuasion: Friction reduction
- beat: urgency-to-act
- blueprint: cta-morph-press (Adapt)
- asset_candidates: assets/portada-ancha.jpg — frascos en el tercio derecho, pared oscura a la izquierda; assets/logo.png — logo de El Puqui
- focal: assets/logo.png
- roles: portada-ancha = background (encuadre en los frascos, oscurecido ~45 %) · logo = cutout (cierre de marca)

narrativeRole: convertir el interés en un mensaje ahora.
keyMessage: escríbenos por WhatsApp.

Adapt: se mantiene la presión del botón que cambia de estado (firma de cta-morph-press); el logo florece antes del botón.
Scene 1 (0.0–1.4s): fondo de la foto de los frascos oscurecida con lenta entrada en foco; el logo florece en el centro superior y "El Puqui" aparece debajo en display crema; línea "Mermeladas y conservas artesanales · Ica" en etiqueta.
Scene 2 (1.4–3.2s): entra el botón píldora verde hoja "Pedir por WhatsApp"; a 2.4s se presiona (escala 0.96) y cambia al número "+51 900 000 000" con el ícono de WhatsApp (morph del texto). Sonido de envío en la presión.
Scene 3 (3.2–5.0s): pie de línea pequeño "Demo de ChenteIA · negocio ficticio"; todo quieto hasta el final, con un fundido suave de salida en los últimos 0.4s.
