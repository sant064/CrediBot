// /config/pocketbaseClient.js

require('dotenv').config();
// Usamos 'pocketbase/cjs' para asegurarnos de que sea compatible con el entorno de Node.js (CommonJS)
const PocketBase = require('pocketbase/cjs');
// --- AÑADE ESTA LÍNEA AQUÍ ---
console.log(`[CONEXIÓN] Intentando conectar a PocketBase en la URL: "${process.env.POCKETBASE_URL}"`);
// -----------------------------

console.log('🔵 Inicializando cliente de PocketBase...');

const pb = new PocketBase(process.env.POCKETBASE_URL);

// Función autoejecutable para autenticar el cliente al iniciar la aplicación
(async () => {
  try {
    // Autenticamos como Admin para tener acceso total desde el backend
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL,
      process.env.POCKETBASE_ADMIN_PASSWORD
    );
    console.log('✅ Autenticación con PocketBase exitosa.');
  } catch (err) {
    console.error('🔴 Error de autenticación con PocketBase. Revisa tus credenciales en .env', err);
  }
})();

// Exportamos la instancia ya inicializada y en proceso de autenticación
module.exports = pb;