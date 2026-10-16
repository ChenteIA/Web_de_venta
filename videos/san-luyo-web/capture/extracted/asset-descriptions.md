# Asset Descriptions

La captura automática (`hyperframes capture`) quedó bloqueada: el navegador de la herramienta sale por el proxy del
entorno, que responde 403 al servidor local. En su lugar se capturó la web real de San Luyo (`next start`) con
Playwright en vista de celular (360 px × 3 = 1080 px de ancho). Son capturas de la página real, no reconstrucciones.

## Capturas de la web en vista de celular

- mobile/page-full.png → assets/page-full.jpg — 1080×11490. La web completa: encabezado, foto de la portada (botellas con corcho), tarjeta de entrada con franja de toldo, logo SL, "Chicha de maní, hecha en Ica.", frase de preventa, botón "Separar mi botella"; la chicha (foto, S/ 5, selector de botellas, botones); Cómo pedir (nota impresa: Hoy / Al confirmar / Desde el lunes 19); reseñas (vacío); contacto (número gigante, Abrir WhatsApp, Copiar número, Dónde/Horario/Pago); pie con Huacachina y "San Luyo". Sin encabezado fijo ni botón flotante (van como capas aparte).
- mobile/header.png → assets/header.png — 1080×192. Encabezado: logo SL, "San Luyo", botón de tema. Fijo arriba al hacer scroll.
- mobile/fab.png → assets/fab.png — 168×168. Botón flotante de WhatsApp.
- mobile/picker-1.png / picker-3.png / picker-6.png → assets/ — el selector de botellas con 1, 3 y 6 elegidas (total S/ 5, S/ 15, S/ 30 y botón "Separar N botellas").
- mobile/positions.json — posiciones en px CSS (×3 en la imagen) de cada sección y los mensajes reales de WhatsApp para 1, 3 y 6 botellas.

## Fotos y marca del proyecto (../../imagenes/)

- logo.png → assets/logo.png — logo SL (monograma crema sobre círculo rojo con aro dorado), fondo transparente.
- portada.jpg → assets/portada.jpg — vertical: dos botellas con corcho y un vaso de chicha, maníes, pared oscura arriba.
- chicha-mani.jpg → assets/chicha-mani.jpg — botella con etiqueta de papel y vaso, sobre mantel con raya roja.
- portada-ancha.jpg → assets/portada-ancha.jpg — botellas, vaso y cuencos de maní a la derecha, pared oscura a la izquierda.
- cierre-ica.jpg → assets/cierre-ica.jpg — el oasis de Huacachina entre dunas al atardecer (16:9).
