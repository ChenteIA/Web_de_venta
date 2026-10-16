# Prompts para generar las fotos con IA (solo para la demo)

Úsalos en ChatGPT (imágenes), Gemini, Ideogram, Leonardo o Midjourney. Están en inglés porque así salen mejor.
Genera todas las fotos de productos en la **misma conversación o con el mismo estilo/semilla** para que se vean como una serie.

Guarda cada imagen con el nombre indicado en esta carpeta (`imagenes/`) y ejecuta `npm run images`.

> No generes capturas de reseñas con IA: esas deben ser mensajes reales de clientes.

**Evitar (negative prompt, si la herramienta lo permite):**
`text, letters, words, watermark, logo, brand name, plastic look, oversaturated, cartoon, illustration, hands, people, blurry`

---

## portada.jpg — vertical 4:5 (mínimo 1440 × 1800 px)

```
Photorealistic food photography for an artisanal jam and preserves shop in Ica, Peru. Four glass jars of homemade jam on a rustic wooden table: apple jam, strawberry jam, orange golden-berry (aguaymanto) jam and a tall jar of peach halves in syrup. Gold metal lids, plain kraft paper labels with no writing, a natural linen cloth. Fresh fruit scattered around: red apples, strawberries, aguaymanto berries with papery husks, peach halves. Warm late-afternoon desert sunlight from the side, soft shadows, shallow depth of field. Earthy palette with deep apple red, leaf green and warm gold accents. Vertical composition with calm empty space at the top. High-end editorial style, no text, no logos, no people.
```

## logo.png — cuadrado 1:1 (mínimo 512 × 512 px)

```
Simple flat vector logo icon for an artisanal jam brand: a rounded glass jam jar silhouette in deep apple red (#A61D27) with a golden lid (#E2A84B) and a small green leaf (#2E6B3B) on top. Bold, geometric, friendly shapes, centered, plain white background, no text, no letters, no gradients, no shadows. Must stay readable at 32 px.
```

Consejo: si la herramienta no da fondo transparente, quítalo con remove.bg o similar y guarda como PNG.

---

## Fotos de la carta — horizontal 4:3 (mínimo 1600 × 1200 px)

Base común (va al inicio de cada prompt de producto):

```
Photorealistic close-up product photo for an artisanal preserves shop in Ica, Peru, part of a consistent series. Rustic wooden table, natural linen cloth, warm natural side light, soft shadows, shallow depth of field, gold metal lid, plain kraft paper label with no writing. Horizontal 4:3, no text, no logos, no people.
```

### mermelada-manzana.jpg
```
[base común] A glass jar of golden-amber apple jam with small visible apple pieces, lid open beside it, a cinnamon stick and two red apples next to the jar, a small wooden spoon with a spoonful of jam.
```

### mermelada-fresa.jpg
```
[base común] An open glass jar of deep red strawberry jam with whole strawberry pieces, fresh strawberries around it, a slice of rustic bread with jam spread on it.
```

### mermelada-aguaymanto.jpg
```
[base común] A glass jar of bright orange golden-berry (aguaymanto, physalis) jam, fresh golden berries with their papery husks partly opened next to it, a wedge of fresh white cheese.
```

### duraznos-almibar.jpg
```
[base común] A tall glass jar filled with golden peach halves in light syrup, a few peach halves served in a small ceramic bowl beside it, light catching the syrup.
```

### encurtido.jpg
```
[base común] A tall glass jar of Peruvian pickled vegetables in vinegar arranged in colorful layers: red onion, carrot sticks, green beans and yellow ají amarillo peppers, a bay leaf, a few loose vegetables beside the jar.
```

### caja-regalo.jpg
```
[base común] An open kraft paper gift box with three small jam jars inside (red strawberry, orange aguaymanto, amber apple) nestled in natural straw, tied with jute twine and a small blank paper tag.
```
