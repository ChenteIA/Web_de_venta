# Música original para el video de San Luyo: 30 s, 100 BPM, re mayor.
# Guitarra punteada (Karplus-Strong), bajo, cajón (golpe grave + chasquido) y shaker suave.
# Progresión por compás: D - A - Bm - G (compás = 2,4 s). Determinista (semilla fija).
import numpy as np, wave, sys

SR = 44100
BPM = 100
BEAT = 60 / BPM            # 0.6 s
BAR = 4 * BEAT             # 2.4 s
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(19)
out = sys.argv[1]

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def pluck(freq, dur, bright=0.5, amp=1.0):
    n = int(SR * dur)
    period = max(2, int(round(SR / freq)))
    buf = rng.uniform(-1, 1, period)
    # cuerpo más suave: filtra el ruido inicial
    for _ in range(2): buf = 0.5 * (buf + np.roll(buf, 1))
    y = np.empty(n)
    decay = 0.996 - (1 - bright) * 0.004
    idx = 0
    for i in range(n):
        y[i] = buf[idx]
        nxt = (idx + 1) % period
        buf[idx] = decay * 0.5 * (buf[idx] + buf[nxt])
        idx = nxt
    env = np.minimum(1, np.arange(n) / (SR * 0.004))
    return y * env * amp

def add(track, sig, t):
    i = int(t * SR)
    if i >= len(track): return
    j = min(len(track), i + len(sig))
    track[i:j] += sig[: j - i]

CHORDS = {  # notas MIDI (raíz del bajo, voces de guitarra)
    'D':  (38, [62, 66, 69, 74]),
    'A':  (45, [61, 64, 69, 73]),
    'Bm': (47, [62, 66, 71, 74]),
    'G':  (43, [62, 67, 71, 74]),
}
PROG = ['D', 'A', 'Bm', 'G']

gtr = np.zeros(N); bass = np.zeros(N); drums = np.zeros(N); shk = np.zeros(N); lead = np.zeros(N)

# Arpegio de guitarra en corcheas: 1-3-2-4-3-2-4-3 de la voz
PATTERN = [0, 2, 1, 3, 2, 1, 3, 2]
nbars = int(np.ceil(DUR / BAR))
for b in range(nbars):
    t0 = b * BAR
    name = PROG[b % 4]
    root, voice = CHORDS[name]
    last = t0 + BAR > DUR - 0.01
    if last:
        # último compás: un rasgueo en re que suena hasta el final
        for k, m in enumerate(CHORDS['D'][1] + [78]):
            add(gtr, pluck(hz(m), DUR - t0, 0.6, 0.55), t0 + k * 0.025)
        add(bass, pluck(hz(38), DUR - t0, 0.3, 0.9), t0)
        continue
    for s, vi in enumerate(PATTERN):
        t = t0 + s * BEAT / 2
        acc = 0.62 if s % 2 == 0 else 0.48
        add(gtr, pluck(hz(voice[vi]), 1.4, 0.55, acc), t)
    # bajo: tiempos 1 y 3 (y un paso en el 4 y)
    add(bass, pluck(hz(root), 1.1, 0.25, 0.95), t0)
    add(bass, pluck(hz(root + 7 if root < 44 else root - 5), 0.9, 0.25, 0.75), t0 + 2 * BEAT)
    add(bass, pluck(hz(root + 12), 0.4, 0.25, 0.45), t0 + 3.5 * BEAT)

# Melodía corta en los compases 5-8 y 9-11 (pentatónica de re), registro alto y suave
MEL = [(4, 0.0, 78), (4, 1.0, 76), (4, 1.5, 74), (4, 2.5, 76), (5, 0.0, 73), (5, 1.0, 76), (5, 2.0, 81),
       (6, 0.0, 78), (6, 1.5, 74), (6, 2.5, 71), (7, 0.0, 74), (7, 2.0, 76),
       (8, 0.0, 78), (8, 1.0, 81), (8, 2.0, 78), (9, 0.0, 76), (9, 1.5, 73), (10, 0.0, 74), (10, 1.0, 78), (10, 2.5, 76), (11, 0.0, 74)]
for bar, beat, m in MEL:
    add(lead, pluck(hz(m), 1.2, 0.8, 0.5), bar * BAR + beat * BEAT)

# Cajón desde el compás 2: golpe grave en 1 y 3, chasquido en 2 y 4; shaker en semicorcheas
def kick(amp=1.0):
    n = int(SR * 0.35); t = np.arange(n) / SR
    f = 95 * np.exp(-t * 18) + 48
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * amp
def slap(amp=1.0):
    n = int(SR * 0.18); t = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    hp = noise - np.concatenate([[0], noise[:-1]])
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (0.55 * hp * np.exp(-t * 38) + 0.5 * body) * amp
def shaker(amp=1.0):
    n = int(SR * 0.07); t = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    hp = noise - np.concatenate([[0], noise[:-1]])
    return hp * np.exp(-t * 60) * amp

for b in range(1, nbars - 1):
    t0 = b * BAR
    for beat in range(4):
        t = t0 + beat * BEAT
        if beat in (0, 2): add(drums, kick(0.9), t)
        else: add(drums, slap(0.55), t)
        if b >= 2:
            for k in range(4):
                add(shk, shaker(0.16 if k % 2 else 0.24), t + k * BEAT / 4)
    add(drums, slap(0.3), t0 + 3.5 * BEAT)

def norm(x):
    p = np.max(np.abs(x)); return x / p if p else x

mix_l = 0.62 * norm(gtr) + 0.55 * norm(bass) + 0.5 * norm(drums) + 0.2 * norm(shk) + 0.34 * norm(lead)
mix_r = 0.5 * norm(gtr) + 0.55 * norm(bass) + 0.5 * norm(drums) + 0.26 * norm(shk) + 0.4 * norm(lead)

# Eco corto (sala pequeña)
def room(x):
    y = x.copy()
    for d, g in [(0.031, 0.22), (0.047, 0.16), (0.083, 0.1), (0.121, 0.06)]:
        k = int(d * SR); y[k:] += g * x[:-k]
    return y
mix_l, mix_r = room(mix_l), room(mix_r)

# Entrada suave (0,4 s) y salida (1,6 s)
env = np.ones(N)
fi = int(0.4 * SR); env[:fi] = np.linspace(0, 1, fi)
fo = int(1.6 * SR); env[-fo:] = np.linspace(1, 0, fo) ** 1.5
mix = np.stack([mix_l * env, mix_r * env], axis=1)
mix = mix / np.max(np.abs(mix)) * 0.89  # pico a -1 dB

pcm = (mix * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', out, f'{DUR}s')
