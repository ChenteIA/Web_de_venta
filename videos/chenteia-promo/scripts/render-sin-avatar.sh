#!/usr/bin/env bash
# Renderiza la versión sin avatar. HyperFrames admite un solo index.html por proyecto, así que se arma
# un proyecto temporal que usa las mismas carpetas assets/ y compositions/ con scripts/sin-avatar.html como raíz.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ln -s "$ROOT/assets" "$TMP/assets"
ln -s "$ROOT/compositions" "$TMP/compositions"
cp "$ROOT/hyperframes.json" "$ROOT/meta.json" "$ROOT/package.json" "$TMP/"
cp "$ROOT/scripts/sin-avatar.html" "$TMP/index.html"
mkdir -p "$ROOT/renders"
npx --yes hyperframes@0.8.168 render "$TMP" --quality high --output "$ROOT/renders/chenteia-web-sin-avatar-raw.mp4"
ffmpeg -v error -y -i "$ROOT/renders/chenteia-web-sin-avatar-raw.mp4" -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy -c:a aac -b:a 192k "$ROOT/renders/chenteia-web-sin-avatar.mp4"
echo "Listo: renders/chenteia-web-sin-avatar.mp4"
