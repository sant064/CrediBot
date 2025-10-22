// /services/chatService.js
const redisClient = require('../config/redisClient');
const instanceRepo = require('../repositories/instanceRepository');

const checkInstanceStatusByTelefono = async (telefono) => {
  console.log(`[Service] ➡️  Función checkInstanceStatusByTelefono llamada con el teléfono: ${telefono}`);
  
  try {
    const key = `instance:${telefono}`;
    console.log(`[Service] ⏳ Intentando obtener la clave '${key}' de Redis...`);

    const statusFromCache = await redisClient.get(key);

    if (statusFromCache) {
      console.log(`[Cache HIT] Estado para teléfono ${telefono}: ${statusFromCache}`);
      return { success: true, status: statusFromCache };
    } 
    
    console.log(`[Cache MISS] Consultando PocketBase para el teléfono ${telefono}...`);
    const instanceRecord = await instanceRepo.getInstanceByTelefono(telefono);

    let statusToCache;

    // --- LÓGICA CORREGIDA Y VERIFICADA ---
    // Si el registro fue encontrado Y su campo "field" es estrictamente true...
    if (instanceRecord && instanceRecord.field === true) {
      // ...entonces el estado es 'bloqueado'.
      statusToCache = 'true';
    } else {
      // ...para todos los demás casos (no se encontró, o el campo es false), el estado es 'false'.
      statusToCache = 'false';
    }
    
    // Guardamos en Redis el estado definitivo, con una caducidad de 10 minutos.
    await redisClient.set(key, statusToCache, { EX: 600 }); 
    
    console.log(`[Cache SET] Estado para teléfono ${telefono} (${statusToCache}) actualizado en Redis (expira en 10 min).`);
    
    return { success: true, status: statusToCache };

  } catch (error) {
    console.error('[Service] 🔴 Error en checkInstanceStatusByTelefono:', error);
    return { success: false, error: 'Error al consultar el servicio' };
  }
};

module.exports = {
  checkInstanceStatusByTelefono,
};