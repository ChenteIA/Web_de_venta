# Prompts para generar las fotos de San Luyo con IA

Úsalos en ChatGPT (imágenes), Gemini, Ideogram, Leonardo o Midjourney. Están en inglés porque así salen mejor.
Genéralos en la **misma conversación** para que las fotos se vean como una serie.
Si ya tienes fotos reales de tu chicha, úsalas: siempre se ven mejor que las de IA.

Guarda cada imagen con el nombre indicado en esta carpeta (`imagenes/`) y ejecuta `npm run images`.
Mientras no haya fotos, la web muestra la ilustración de la botella.

> No generes capturas de reseñas con IA: esas deben ser mensajes reales de clientes.

**Evitar (negative prompt):** `text, letters, words, watermark, logo, brand name, plastic look, oversaturated, cartoon, hands, people, blurry`

---

## chicha-mani.jpg — foto del producto, horizontal 4:3 (mínimo 1600 × 1200 px)

```
Photorealistic product photo of a 500 ml clear glass bottle filled with Peruvian peanut chicha (chicha de maní): a creamy, opaque, light beige drink with a soft milky texture, cold with tiny condensation drops on the glass, simple gold metal cap, plain kraft paper label with no writing. Next to it a short glass filled with the same creamy drink, and a small pile of roasted peanuts in their shells and a few shelled peanuts on a rustic wooden table with a natural linen cloth. Warm natural side light from a window, soft shadows, shallow depth of field. Earthy palette with warm beige and gold, a small touch of deep red. Horizontal 4:3, no text, no logos, no people.
```

## chicha-mani-litro.jpg — botella de 1 litro, horizontal 4:3 (mínimo 1600 × 1200 px)

Genérala en la misma conversación que `chicha-mani.jpg`, para que las dos fotos se vean como una serie.

```
Same scene, light and style as the previous product photo, now with a larger 1 liter clear glass bottle filled with the same creamy, opaque, light beige peanut chicha, cold with tiny condensation drops, the same simple gold metal cap and plain kraft paper label with no writing. The bottle is clearly taller and wider than a 500 ml bottle; next to it two short glasses filled with the same drink, ready to share, and roasted peanuts in their shells on the rustic wooden table with the natural linen cloth. Warm natural side light from a window, soft shadows, shallow depth of field. Earthy palette with warm beige and gold, a small touch of deep red. Horizontal 4:3, no text, no logos, no people.
```

## portada.jpg — portada en celular, vertical 4:5 (mínimo 1440 × 1800 px)

```
Photorealistic vertical food photograph for a homemade peanut chicha (chicha de maní) brand in Ica, Peru. Two 500 ml glass bottles of creamy light beige peanut drink and a full glass, cold with condensation, on a rustic wooden table, roasted peanuts in their shells scattered around, a linen cloth. The bottles sit in the lower third of the frame; the upper half is a calm, dark, out-of-focus warm brown wall with empty space for a headline. Warm late-afternoon desert sunlight from the side. No text, no logos, no people.
```

## portada-ancha.jpg — portada en computadora, horizontal 16:9 (mínimo 1920 × 1080 px)

```
Same scene and style as the previous image, in a wide 16:9 horizontal composition: the bottles of creamy light beige peanut chicha, the full glass and the roasted peanuts are placed in the right third of the frame; the left two thirds are a calm, dark, out-of-focus warm brown wall with empty space for a headline. Warm side light, no text, no logos, no people.
```

## logo.png — cuadrado 1:1 (mínimo 512 × 512 px)

```
Simple flat vector logo icon for a homemade peanut drink brand: a single peanut in its shell in warm gold (#E2A84B) with darker gold texture marks (#B97A22), centered on a deep red circle (#A61D27). Bold, geometric, friendly shapes, plain white background outside the circle, no text, no letters, no gradients, no shadows. Must stay readable at 32 px.
```

Consejo: si la herramienta no da fondo transparente, quítalo con remove.bg y guarda como PNG.
