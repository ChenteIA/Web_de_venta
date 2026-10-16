# Asset Descriptions

⚠️  No vision credentials — descriptions below are catalog-derived (alt text, headings, section context, filename) instead of Vision-generated. To get richer Vision descriptions on the next capture, set GEMINI_API_KEY (or GOOGLE_API_KEY), or HYPERFRAMES_VERTEX_PROJECT_ID plus HYPERFRAMES_VERTEX_SERVICE_ACCOUNT for Vertex service-account auth, and re-run.

The `logo-<hash>.svg` filename prefix is a structural hint (DOM said this SVG was inside a `<header>`, home-link `<a>`, or had an aria-label matching the page brand). To pick the actual brand logo without Vision, open the `logo-*` candidates in a previewer or rasterize them with `sharp` before referencing — composing a fake logo ships off-brand in the final video.

- svgs/logo-b1208fa9.svg — logo b1208fa9
- svgs/svg-166df1ea-2.svg — svg 166df1ea 2
- svgs/svg-166df1ea-3.svg — svg 166df1ea 3
- svgs/svg-166df1ea-4.svg — svg 166df1ea 4
- svgs/svg-166df1ea-5.svg — svg 166df1ea 5
- svgs/svg-166df1ea-6.svg — svg 166df1ea 6
- svgs/svg-166df1ea-7.svg — svg 166df1ea 7
- svgs/svg-166df1ea-8.svg — svg 166df1ea 8
- svgs/svg-166df1ea.svg — svg 166df1ea
- svgs/svg-87379a94.svg — svg 87379a94

## Capturas de la web en vista de celular (360 px × 3 = 1080 px de ancho)

- mobile/page-full.png → assets/page-full.jpg — 1080×17613. La web completa de arriba a abajo: aviso demo, encabezado, portada, datos, la carta (6 productos), Cómo pedir, reseñas, pie. Sin encabezado fijo ni botón flotante (van como capas aparte).
- mobile/header.png → assets/header.png — 1080×195. Encabezado de la web (logo, "El Puqui", botón de tema); fijo arriba al hacer scroll.
- mobile/fab.png → assets/fab.png — botón flotante de WhatsApp (abajo a la derecha).
- mobile/positions.json — posiciones en px CSS (×3 en la imagen): carta 974, botón de "Mermelada de fresa" y=2024 x=40 w=280 h=48, Cómo pedir 4180, alto total 5871.
