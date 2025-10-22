// /repositories/sessionRepository.js

const pb = require('../config/pocketbaseClient');
const COLLECTION_ID = 'pbc_3660498186'; // <-- ¡PONER EL ID REAL!

/**
 * Busca una sesión por el 'sender'. Si no existe, la crea.
 * Si existe, incrementa el contador de mensajes.
 * @param {string} sender El número de teléfono del usuario.
 * @returns {Promise<object>} El registro de la sesión.
 */
async function findOrCreateSession(sender) {
  try {
    //console.log(`[SessionRepo] 🔎 Buscando sesión con sender: "${sender}"`);
    const session = await pb.collection(COLLECTION_ID).getFirstListItem(`sender = "${sender}"`);

    //console.log(`[SessionRepo] ✅ Sesión encontrada para ${sender}. ID: ${session.id}, Contador actual: ${session.message_count}`);
    
    // --- CORRECCIÓN DEFINITIVA ---
    // 1. Convertimos el valor del contador a un número entero con parseInt().
    const currentCount = parseInt(session.message_count, 10);
    
    // 2. Ahora, la suma es matemática, no de texto.
    const newCount = currentCount + 1; 
    
    const updatedSession = await pb.collection(COLLECTION_ID).update(session.id, {
      message_count: newCount,
    });
    // --- FIN DE LA CORRECCIÓN ---

    //console.log(`[SessionRepo] ✨ Contador incrementado. Nuevo contador: ${updatedSession.message_count}`);
    return updatedSession;

  } catch (error) {
    if (error.status === 404) {
     // console.log(`[SessionRepo] ⚠️  No se encontró sesión para "${sender}". Creando una nueva...`);
      const newSession = await pb.collection(COLLECTION_ID).create({
        sender: sender,
        message_count: 1,
        intent: null
      });
     // console.log(`[SessionRepo] ✅ Nueva sesión creada con ID: ${newSession.id}`);
      return newSession;
    }
    console.error(`[SessionRepo] 🔴 Error buscando/creando sesión:`, error);
    throw error;
  
  }
}

/**
 * Actualiza la intención de una sesión específica.
 * @param {string} sessionId El ID del registro de la sesión.
 * @param {string} intent La intención reconocida.
 * @returns {Promise<object>} La sesión actualizada.
 */
async function updateIntent(sessionId, intent) {
 // console.log(`[SessionRepo] 📝 Actualizando intención a "${intent}" para la sesión ${sessionId}`);
  const updatedSession = await pb.collection(COLLECTION_ID).update(sessionId, { intent });
  return updatedSession;
}

async function updateSessionData(sessionId, updateData) {
 // console.log(`[SessionRepo] 📝 Actualizando intención a "${updateData}" para la sesión ${sessionId}`);
  var intent=updateData
  const updatedSession = await pb.collection(COLLECTION_ID).update(sessionId, { intent });
  return updatedSession;
}


module.exports = {
  findOrCreateSession,
  updateIntent,updateSessionData
};