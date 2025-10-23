# --- ETAPA 1: "EL CONSTRUCTOR" ---
FROM node:20 AS builder
WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .

# --- ETAPA 2: "EL EJECUTOR" (Imagen Final) ---
FROM node:20-slim

# Instala SOLAMENTE las librerías de Linux que Chrome necesita
# ¡ESTA ES LA LISTA CORREGIDA PARA DEBIAN 12 (node:20-slim)!
# (Se han eliminado los sufijos "t64")
RUN apt-get update && apt-get install -y \
    libatk-bridge2.0-0 \
    libcups2 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libcairo2 \
    libpango-1.0-0 \
    libasound2 \
    libnss3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY --from=builder /workspace .

ENV PUPPETEER_SKIP_DOWNLOAD=true

EXPOSE 3001
CMD ["node", "app.js"]