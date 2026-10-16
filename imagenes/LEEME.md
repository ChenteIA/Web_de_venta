# Fotos del negocio

Pon aquí las fotos originales y ejecuta `npm run images` (también corre solo en `npm run dev` y `npm run build`).
Los prompts para generarlas con IA están en `PROMPTS.md`.

| Archivo | Uso |
|---|---|
| `portada.jpg` | Portada en celular, vertical (si falta, se muestra la ilustración de la botella) |
| `portada-ancha.jpg` | Portada en computadora, horizontal 16:9 |
| `logo.png` | Logo del encabezado y favicon (si falta, se usa el maní SVG) |
| `cierre-ica.jpg` | Foto del pie de página: el oasis de Huacachina (horizontal 16:9) |
| `chicha-mani.jpg` | Foto de la chicha de maní en la sección "Nuestra chicha" |

Se convierten a WebP en varios tamaños dentro de `public/img/`.

`archivo-el-puqui/` guarda las fotos de la demo anterior (El Puqui). El script no las usa.
