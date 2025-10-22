// /home/avi-backend/repositories/configRepository.js

// 1. IMPORTAR el cliente de Pocketbase. 
// Esto resuelve el error "pocketbase is not defined".
const pocketbase = require('../config/pocketbaseClient'); 

// 2. Definir el nombre de la colección. 
// Esto resuelve el error 404 de "Missing collection context" 
// al usar el nombre correcto: 'configuracion_bot'.
const COLLECTION_NAME = 'configuracion_bot'; 

/**
 * Busca un valor de configuración en Pocketbase por su clave.
 * @param {string} key - La clave de configuración a buscar (e.g., "595981133313").
 * @returns {Promise<string|null>} El valor (value) de la configuración o null si no se encuentra.
 */
async function getValueByKey(key) {
     // --- Lógica de Depuración (Opcional, se puede comentar después) ---
    try {
        const collections = await pocketbase.collections.getList();
      
    } catch (e) {
        console.error("[ConfigRepo] ❌ FALLO AL LISTAR COLECCIONES:", e.message);
    }
    // -------------------------------------------------------------------

    try {
        // Usa el método getFirstListItem con un filtro en el campo 'key'
        const record = await pocketbase.collection(COLLECTION_NAME).getFirstListItem(`key="${key}"`);
        
      
        
        // Retorna el campo 'value' (asumiendo que así se llama en Pocketbase)
        return record.value; 

    } catch (error) {
        // El SDK de Pocketbase lanza un 404 si el registro no existe
        if (error.status === 404) {
            console.log(`[ConfigRepo] ⚠️ Configuración con clave "${key}" no encontrada.`);
            return null; // Devuelve null si no se encuentra (comportamiento esperado)
        }
        
        // Manejar cualquier otro error de conexión o servidor
        console.error(`[ConfigRepo] 🔴 Error obteniendo configuración:`, error);
        throw error; // Propagar el error al controlador para que responda con 500
    }
}

module.exports = {
    getValueByKey
};