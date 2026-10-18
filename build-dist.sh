#!/bin/sh
# Gera ./dist pronto para qualquer hospedagem estática (Netlify Drop, Cloudflare Pages, GitHub Pages).
set -e
cd "$(dirname "$0")"
sh scripts/build-site.sh dist
