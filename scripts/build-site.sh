#!/bin/sh
# Monta a pasta do site (padrão ./site): jogo + three.js enxuto + lista de arquivos para o modo offline.
# Usado pelo Dockerfile e pelo GitHub Actions, para os dois publicarem exatamente a mesma coisa.
set -e
cd "$(dirname "$0")/.."
OUT=${1:-site}
THREE=0.186.1

[ -f node_modules/three/package.json ] && grep -q "\"version\": \"$THREE\"" node_modules/three/package.json \
  || npm i "three@$THREE" --no-save --no-package-lock --no-audit --no-fund

rm -rf "$OUT"
mkdir -p "$OUT/vendor/three/build" "$OUT/vendor/three/examples/jsm/utils"
# só o que o jogo importa: o núcleo do three e o utilitário de mesclar geometrias
cp node_modules/three/build/three.module.js node_modules/three/build/three.core.js "$OUT/vendor/three/build/"
cp node_modules/three/examples/jsm/utils/BufferGeometryUtils.js "$OUT/vendor/three/examples/jsm/utils/"
cp -r index.html style.css manifest.webmanifest sw.js icons src "$OUT/"
# GitHub Pages: não passar pelo Jekyll
touch "$OUT/.nojekyll"
# lista de arquivos que o service worker guarda para jogar offline
(cd "$OUT" && find . -type f ! -name files.json ! -name sw.js ! -name .nojekyll | sed 's|^\./||' | sort \
  | awk 'BEGIN{printf "["} {printf "%s\"%s\"", (NR>1?",":""), $0} END{print "]"}' > files.json)
echo "site pronto em $OUT ($(find "$OUT" -type f | wc -l) arquivos)"
