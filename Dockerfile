# 1. Empezar con la imagen COMPLETA de Node (no la 'slim')
FROM node:20

# 2. Instalar las librerías de Linux (versión Debian) ANTES de todo
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

# 3. Preparar la carpeta de trabajo
WORKDIR /workspace

# 4. Copiar el package.json
COPY package*.json ./

# 5. Instalar dependencias
# Ahora, 'npm install puppeteer' SÍ descargará Chrome
# porque ya instalamos las librerías de Linux en el paso 2
RUN npm install

# 6. Copiar todo el resto de tu código
COPY . .

# 7. Exponer tu puerto
EXPOSE 3001

# 8. Correr la app
# (Recuerda tener --no-sandbox en tu código de puppeteer.launch())
CMD ["node", "app.js"]