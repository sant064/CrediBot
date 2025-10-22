// /repositories/chatRepository.js

const pb = require('../config/pocketbaseClient');

// VE A POCKETBASE Y COPIA EL ID DE LA COLECCIÓN "chats"
const COLLECTION_ID = 'pbc_1116771610'; 

/**
 * Guarda un nuevo mensaje de chat en PocketBase.
 * @param {object} chatData Un objeto con los datos del chat.
 * @returns {Promise<object>} El registro del chat que fue creado.
 */
// /repositories/chatRepository.js

async function createChatLog(chatData) {
  try {
  
    
    const data = {
      // Datos existentes
      "sender": chatData.sender,
      "message": chatData.message,
      "fromMe": chatData.fromMe,
      "status": chatData.status,
      "instanceId": chatData.instanceId,

      // --- NUEVOS CAMPOS ---
      "tipo": chatData.tipo,
      "fuente": chatData.fuente,
      "clase": chatData.clase,
    };

    const record = await pb.collection(COLLECTION_ID).create(data);
    
  
    return record;

  } catch (error) {
    // ... (el resto del código no cambia)
  }
}

/**
 * --- NUEVA FUNCIÓN ---
 * Obtiene todos los registros de la colección de chats.
 * @returns {Promise<Array>} Una lista con todos los chats guardados.
 */
async function getAllChats() {
  try {
   
    
    // getFullList() trae todos los registros de una vez.
    const records = await pb.collection(COLLECTION_ID).getFullList({
        // Opcional: puedes ordenar los resultados por fecha de creación, los más nuevos primero.
        sort: '-created',
    });
    
  
    return records;

  } catch (error) {
    console.error(`[ChatRepo] 🔴 Error al obtener todos los chats:`, error);
    throw error;
  }
}

// Actualiza la línea de module.exports para incluir la nueva función
module.exports = {
  createChatLog,
  getAllChats, // <--- Añade esto
};