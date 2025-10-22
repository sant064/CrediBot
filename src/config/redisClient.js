// /config/redisClient.js

require('dotenv').config();
const { createClient } = require('redis');

// Crea el cliente con la configuración
const redisClient = createClient({
  socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD
});

// Manejador de errores para estar siempre informado
redisClient.on('error', (err) => {
  console.error('🔴 Error en el cliente de Redis:', err);
});

// Conectamos el cliente en una función asíncrona que se autoejecuta
(async () => {
    try {
        await redisClient.connect();
        console.log('✅ Cliente de Redis conectado exitosamente.');

        // --- NUEVA LÓGICA CONDICIONAL ---
        // Leemos la bandera del archivo .env.
        // Solo si NODE_ENV es exactamente "development", limpiamos el caché.
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️  [MODO DESARROLLO] La bandera NODE_ENV es "development". Limpiando caché...');
            await redisClient.flushDb();
            console.log('✅  [MODO DESARROLLO] Base de datos de Redis limpiada.');
        }
        // ------------------------------------

    } catch (err) {
        console.error('🔴 No se pudo conectar a Redis:', err);
    }
})();

// Exporta el cliente ya configurado (y en proceso de conexión)
module.exports = redisClient;