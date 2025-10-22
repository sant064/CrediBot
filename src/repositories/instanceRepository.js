// /repositories/instanceRepository.js

const pb = require('../config/pocketbaseClient');

// El ID único de tu colección "instancias"
const COLLECTION_ID = 'pbc_2688846032';

async function getInstanceById(id) {
  try {
    console.log(`[PocketBase] 🔎 Buscando en la colección ${COLLECTION_ID} el registro con ID: ${id}`);
    
    // CAMBIO: Usamos el ID de la colección en lugar del nombre
    const record = await pb.collection(COLLECTION_ID).getOne(id);
    
    console.log(`[PocketBase] ✅ Registro encontrado por ID. Contenido:`);
    console.log(JSON.stringify(record, null, 2)); 
    
    return record;
    
  } catch (error) {
    if (error.status === 404) {
      console.warn(`[PocketBase] ⚠️ Registro con ID '${id}' no encontrado.`);
      return null; 
    }
    console.error(`[PocketBase] 🔴 Error al obtener el registro por ID '${id}':`, error);
    throw error;
  }
}

async function getInstanceByTelefono(telefono) {
  try {
    console.log(`[PocketBase] 🔎 Buscando en la colección ${COLLECTION_ID} un registro con teléfono: ${telefono}`);
    
    const filter = `telefono ~ "${telefono}"`;
    console.log(`[PocketBase] Usando filtro LIKE: "${filter}"`);
    
    // CAMBIO: Usamos el ID de la colección en lugar del nombre
    const record = await pb.collection(COLLECTION_ID).getFirstListItem(filter);
    
    console.log(`[PocketBase] ✅ ¡ÉXITO! Registro encontrado por teléfono. Contenido:`);
    console.log(JSON.stringify(record, null, 2));

    return record;

  } catch (error) {
    console.error(`🔴 PocketBase retornó un error. Objeto de error COMPLETO:`);
    console.log(JSON.stringify(error, null, 2));
    return null; // Devolvemos null en caso de error para no romper el flujo
  }
}

module.exports = {
  getInstanceById,
  getInstanceByTelefono,
};