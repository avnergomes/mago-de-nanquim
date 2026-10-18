# Estágio 1: monta o site com o mesmo script do GitHub Actions (three.js baixado e embutido)
FROM node:22-alpine AS build
WORKDIR /app
COPY index.html style.css manifest.webmanifest sw.js ./
COPY icons icons
COPY src src
COPY scripts scripts
RUN sh scripts/build-site.sh /site

# Estágio 2: servidor estático
FROM nginx:1.27-alpine
COPY --from=build /site /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
