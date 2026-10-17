# Prepara el avatar para animarlo: limpia el borde blanco del recorte, separa la cabeza del cuerpo
# y genera la boca en varias aperturas (mandíbula que baja) y los ojos medio cerrados y cerrados.
# Uso: python3 scripts/avatar_vivo.py   (lee assets/avatar/*.png, escribe assets/avatar/vivo/ y vivo.json)
# Los puntos de la cara salen de MediaPipe Face Landmarker (boca y mentón); los ojos se midieron a mano
# porque los ojos grandes del personaje no siguen las proporciones de una cara real.
import os, json
import numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = f"{ROOT}/assets/avatar", f"{ROOT}/assets/avatar/vivo"
os.makedirs(OUT, exist_ok=True)

# Puntos en px de la imagen (768x1376): comisuras, centro del labio inferior interno, mentón, ojos (cx, cy, rx, ry)
FACE = {
    "saluda":   dict(lc=(343, 301), rc=(438, 300), lip=(394, 322), chin=(395, 367), open_mouth=True,
                     eyes=[(340, 235, 31, 20), (441, 236, 28, 20)]),
    "senala":   dict(lc=(354, 308), rc=(430, 306), lip=(394, 312), chin=(395, 364), open_mouth=False,
                     eyes=[(339, 239, 31, 24), (440, 238, 27, 24)]),
    "presenta": dict(lc=(354, 308), rc=(430, 306), lip=(394, 313), chin=(394, 364), open_mouth=False,
                     eyes=[(339, 238, 31, 24), (440, 238, 27, 24)]),
    "pulgar":   dict(lc=(352, 306), rc=(431, 305), lip=(393, 313), chin=(393, 364), open_mouth=False,
                     eyes=[(339, 239, 31, 24), (440, 238, 27, 24)]),
}
HAND = {"saluda": ([(108, 238), (248, 238), (248, 306), (268, 310), (268, 330), (232, 398), (218, 420), (218, 494), (112, 494)], (178, 498))}
HEAD_X = (244, 530)          # la cabeza (con orejas y pelo) cabe en este ancho
OPEN = {True: [4, 7, 10, 13], False: [6, 10, 14, 18]}  # aperturas de la boca (px) según si ya sonríe con la boca abierta
LASH = (38, 24, 22)          # color de las pestañas


def clean_edges(rgba):
    """Quita restos del fondo y el halo claro del recorte: borra el humo semitransparente lejos del cuerpo,
    recorta 1 px el borde y le pone el color del interior."""
    a = rgba[..., 3].astype(np.float32)
    ell = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r))
    core = cv2.morphologyEx((a > 200).astype(np.uint8), cv2.MORPH_OPEN, ell(5))
    allowed = cv2.GaussianBlur(cv2.dilate(core, ell(5)).astype(np.float32), (0, 0), 1)
    a = np.clip((a * allowed - 60) * 255 / 170, 0, 255)
    solid = (a > 128).astype(np.uint8)
    dist = cv2.distanceTransform(solid, cv2.DIST_L2, 5)
    inner = (dist > 3.5).astype(np.float32)
    rgb = rgba[..., :3].astype(np.float32)
    num = cv2.GaussianBlur(rgb * inner[..., None], (0, 0), 3)
    den = cv2.GaussianBlur(inner, (0, 0), 3)[..., None]
    fill = num / np.maximum(den, 1e-4)
    # Mezcla: en el borde exterior manda el color del interior; a 3.5 px hacia dentro, el original
    k = np.clip(1 - dist / 3.5, 0, 1)[..., None] * (den > 0.01)
    rgb = rgb * (1 - k) + fill * k
    return np.dstack([np.clip(rgb, 0, 255), a]).astype(np.uint8)


def lip_curve(f, x):
    """Línea del labio inferior interno: parábola que pasa por las comisuras y el centro."""
    (x0, y0), (x1, y1), (xm, ym) = f["lc"], f["rc"], f["lip"]
    A = np.array([[x0 * x0, x0, 1], [x1 * x1, x1, 1], [xm * xm, xm, 1]], np.float64)
    a, b, c = np.linalg.solve(A, [y0, y1, ym])
    return a * x * x + b * x + c


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def mouth_sprite(img, f, o):
    """Baja la mandíbula `o` px y pinta el interior de la boca en el hueco."""
    h, w = img.shape[:2]
    (x0, _), (x1, _) = f["lc"], f["rc"]
    cx, half = (x0 + x1) / 2, (x1 - x0) / 2
    chin_y = f["chin"][1]
    bx0, bx1 = int(x0 - 58), int(x1 + 58)
    by0, by1 = int(min(f["lc"][1], f["rc"][1]) - 22), int(chin_y + 48)
    xs, ys = np.meshgrid(np.arange(bx0, bx1, dtype=np.float32), np.arange(by0, by1, dtype=np.float32))
    line = lip_curve(f, xs)
    dx = np.abs(xs - cx) / half
    # Forma de la abertura: cerrada en las comisuras, máxima al centro
    shape = np.sqrt(np.clip(1 - dx ** 2, 0, 1))
    # Toda la mandíbula baja; las mejillas se estiran y el cuello absorbe el movimiento
    jaw_h = np.maximum(shape, 1 - smooth((dx - 1) / 0.75)) * (1 - smooth((dx - 0.6) / 1.1) * 0.35)
    # Dentro de la boca el labio se separa de golpe; fuera de ella la piel se estira sin cortes
    ramp = 0.5 + 26 * smooth((dx - 0.85) / 0.5)
    jaw_v = smooth((ys - line) / ramp) * (1 - smooth((ys - chin_y) / 40))
    d = o * jaw_h * jaw_v
    mx, my = xs, (ys - d).astype(np.float32)
    patch = cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    # Interior de la boca en el hueco (entre la línea del labio y la línea + apertura)
    gap = o * shape
    t = (ys - line) / np.maximum(gap, 1e-3)
    inside = (ys >= line) & (ys < line + gap) & (dx < 1)
    cov = np.clip(np.minimum(ys - line + 0.5, line + gap - ys + 0.5), 0, 1) * inside * np.clip(gap - 0.3, 0, 1)
    cov = cv2.GaussianBlur(cov.astype(np.float32), (0, 0), 0.6)
    dark = np.array([42, 14, 16], np.float32)        # fondo de la boca
    tongue = np.array([96, 34, 36], np.float32)      # lengua al fondo, apenas más clara
    teeth = np.array([236, 230, 222], np.float32)
    col = dark + (tongue - dark) * smooth((t - 0.6) / 0.4)[..., None] * 0.7
    if not f["open_mouth"]:
        tooth = (ys - line) < np.minimum(gap * 0.22, 2.4)
        col = np.where((tooth & inside)[..., None], teeth * 0.9, col)
    patch[..., :3] = patch[..., :3] * (1 - cov[..., None]) + col * cov[..., None]
    # Sombra suave bajo el labio inferior para que no parezca recortado
    return patch.clip(0, 255).astype(np.uint8), (bx0, by0)


def eyes_sprite(img, f, level):
    """level 1 = medio cerrado, 2 = cerrado. El párpado se rellena con la piel de alrededor."""
    ex = [(cx - rx - 6, cy - ry - 8, cx + rx + 6, cy + ry + 6) for cx, cy, rx, ry in f["eyes"]]
    bx0, by0 = int(min(e[0] for e in ex)), int(min(e[1] for e in ex))
    bx1, by1 = int(max(e[2] for e in ex)), int(max(e[3] for e in ex))
    patch = img[by0:by1, bx0:bx1].copy()
    ph, pw = patch.shape[:2]
    mask = np.zeros((ph, pw), np.uint8)
    lash = []
    for cx, cy, rx, ry in f["eyes"]:
        c = (int(cx - bx0), int(cy - by0))
        full = np.zeros_like(mask)
        cv2.ellipse(full, (c[0], c[1] - 2), (rx + 3, ry + 6), 0, 0, 360, 255, -1)  # incluye la línea de pestañas
        if level == 1:
            # Párpado a medio bajar: su borde es una curva que baja hacia el centro
            cut = np.zeros_like(mask)
            pts = [(int(c[0] + dx), int(c[1] - ry * 0.25 + 6 * (1 - (dx / rx) ** 2))) for dx in range(-rx - 4, rx + 5, 2)]
            poly = np.array([(c[0] - rx - 6, 0), *pts, (c[0] + rx + 6, 0)], np.int32)
            cv2.fillPoly(cut, [poly], 255)
            full = cv2.bitwise_and(full, cut)
        mask |= full
        lash.append((c, rx, ry))
    # Párpado: color de la piel justo debajo del ojo (dentro del lente), con sombra hacia arriba
    out = patch.astype(np.float32)
    lid = np.zeros((ph, pw, 3), np.float32)
    yy = np.arange(ph, dtype=np.float32)[:, None]
    for (c, rx, ry) in lash:
        band = patch[c[1] + ry + 5:c[1] + ry + 10, c[0] - rx // 2:c[0] + rx // 2, :3].reshape(-1, 3)
        skin = np.median(band, axis=0).astype(np.float32)
        t = np.clip((yy - (c[1] - ry - 6)) / (2 * ry + 8), 0, 1)
        g = (0.80 + 0.2 * smooth(t * 1.6))[..., None]
        xx = np.arange(pw)[None, :]
        near = (np.abs(xx - c[0]) <= rx + 12)[..., None]
        lid = np.where(near, skin * g, lid)
    m = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.4)
    out[..., :3] = out[..., :3] * (1 - m[..., None]) + lid * m[..., None]
    # Línea de pestañas en el borde del párpado
    canvas = out[..., :3].copy()
    for (c, rx, ry) in lash:
        if level == 2:
            cv2.ellipse(canvas, (c[0], c[1] + 3), (rx - 4, int(ry * 0.4)), 0, 15, 165, LASH, 2, cv2.LINE_AA)
        else:
            pts = np.array([(c[0] + dx, c[1] - ry * 0.25 + 6 * (1 - (dx / rx) ** 2)) for dx in range(-rx + 3, rx - 2, 2)], np.int32)
            cv2.polylines(canvas, [pts], False, LASH, 2, cv2.LINE_AA)
    out[..., :3] = canvas
    return out.clip(0, 255).astype(np.uint8), (bx0, by0)


def save(arr, name):
    cv2.imwrite(f"{OUT}/{name}.png", cv2.cvtColor(arr, cv2.COLOR_RGBA2BGRA))


meta = {}
for name, f in FACE.items():
    img = cv2.cvtColor(cv2.imread(f"{SRC}/{name}.png", cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA)
    img = clean_edges(img)
    h, w = img.shape[:2]
    chin_x, chin_y = f["chin"]
    # Cabeza: todo lo que está sobre el cuello, desvanecido hacia abajo
    hx0, hx1, hy0, hy1 = HEAD_X[0], HEAD_X[1], 20, chin_y + 34
    yy = np.arange(h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    xx = np.ones((h, 1), np.float32) * np.arange(w, dtype=np.float32)[None, :]
    fade = 1 - smooth((yy - (chin_y + 4)) / 28)
    side = smooth((xx - hx0) / 6) * (1 - smooth((xx - (hx1 - 6)) / 6))
    head = img.copy()
    head[..., 3] = (img[..., 3] * fade * side).astype(np.uint8)
    # Cuerpo: la silueta de la cabeza se encoge unos px para que la cabeza girada siempre la tape
    body = img.copy()
    shrunk = cv2.erode(img[..., 3], cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    zone = (1 - smooth((yy - (chin_y - 30)) / 26)) * side
    body[..., 3] = (img[..., 3] * (1 - zone) + shrunk * zone).astype(np.uint8)
    m_hand = None
    if name in HAND:
        # Mano que saluda: antebrazo y mano en una capa aparte que gira desde el puño de la manga
        poly, pivot = HAND[name]
        reg = np.zeros((h, w), np.uint8)
        cv2.fillPoly(reg, [np.array(poly, np.int32)], 255)
        reg = cv2.GaussianBlur(reg.astype(np.float32) / 255, (0, 0), 1.5)
        hand = img.copy()
        hand[..., 3] = (img[..., 3] * reg * (1 - smooth((yy - (pivot[1] - 8)) / 6))).astype(np.uint8)
        x0, y0, x1, y1 = (min(p[0] for p in poly) - 4, min(p[1] for p in poly) - 4, max(p[0] for p in poly) + 4, pivot[1] + 2)
        save(hand[y0:y1, x0:x1], f"{name}-mano")
        keep = smooth((yy - (pivot[1] - 34)) / 14)  # el cuerpo conserva el antebrazo junto a la manga
        body[..., 3] = (body[..., 3] * (1 - reg * (1 - keep))).astype(np.uint8)
        m_hand = dict(box=[x0, y0, x1 - x0, y1 - y0], pivot=list(pivot))
    save(body, f"{name}-cuerpo")
    save(head[hy0:hy1, hx0:hx1], f"{name}-cabeza")
    m = dict(head=[hx0, hy0, hx1 - hx0, hy1 - hy0], pivot=[chin_x, chin_y + 18], mouth=[], eyes=[])
    for k, o in enumerate(OPEN[f["open_mouth"]], 1):
        sp, (x, y) = mouth_sprite(img, f, o)
        sp[..., 3] = np.maximum(sp[..., 3], 0)
        save(sp, f"{name}-boca-{k}")
        m["mouth"].append([x, y, sp.shape[1], sp.shape[0]])
    for lv in (1, 2):
        sp, (x, y) = eyes_sprite(img, f, lv)
        save(sp, f"{name}-ojos-{lv}")
        m["eyes"].append([x, y, sp.shape[1], sp.shape[0]])
    if m_hand: m["hand"] = m_hand
    meta[name] = m
json.dump(meta, open(f"{OUT}/vivo.json", "w"), indent=1)
print("ok", {k: v["head"] for k, v in meta.items()})
