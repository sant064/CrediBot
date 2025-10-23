# --- ETAPA 1: "EL CONSTRUCTOR" ---
# Empezamos con la imagen completa de Node para instalar todo
FROM node:20 AS builder

# Creamos la carpeta de trabajo
WORKDIR /workspace

# Copiamos el package.json y el lockfile
COPY package*.json ./

# Ejecutamos 'npm install'
# Esto instalará todas las dependencias (axios, express, etc.)
# Y también descargará el navegador Chrome (gracias a "puppeteer")
RUN npm install

# Copiamos todo el resto de tu código (app.js, .env, services/, etc.)
COPY . .


# --- ETAPA 2: "EL EJECUTOR" (Imagen Final) ---
# Empezamos con una imagen "slim" (ligera) que no tiene herramientas de build
FROM node:20-slim

# Instala SOLAMENTE las librerías de Linux que Chrome necesita
# Esta es la lista corregida para Ubuntu/Debian 24.04
RUN apt-get update && apt-get install -y \
    libatk-bridge2.0-0t64 \
    libcups2t64 \
    libatspi2.0-0t64 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libcairo2 \
    libpango-1.0-0 \
    libasound2t64 \
    libnss3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Creamos la carpeta de trabajo
WORKDIR /workspace

# ¡LA MAGIA! Copiamos los archivos listos de la Etapa 1
# Esto trae tu app.js Y el node_modules (CON Chrome ya descargado)
COPY --from=builder /workspace .

# Le decimos a Puppeteer que NO intente descargar Chrome de nuevo
# (porque ya lo copiamos de la Etapa 1)
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Expone el puerto que usa tu app (vi "3001" en tu .env)
EXPOSE 3001

# Comando final para correr la app
# (Recuerda tener --no-sandbox en tu código de puppeteer.launch())
CMD ["node", "app.js"]