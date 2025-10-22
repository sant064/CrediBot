// /repositories/loanRepository.js

const pb = require('../config/pocketbaseClient');

// IMPORTANTE: Ve a PocketBase, copia el ID de tu colección "solicitudes_prestamo" y pégalo aquí.
const COLLECTION_ID = 'pbc_4169454214'; 

/**
 * Busca una solicitud de préstamo por el 'sender'. Si no existe, la crea.
 * @param {string} sender El número de teléfono del usuario.
 * @returns {Promise<object>} El registro de la solicitud.
 */
async function findOrCreateLoanApplication(sender) {
    try {
        const application = await pb.collection(COLLECTION_ID).getFirstListItem(`telefono = "${sender}"`);
        console.log(`[LoanRepo] ✅ Solicitud encontrada para ${sender}.`);
        return application;
    } catch (error) {
        if (error.status === 404) {
            console.log(`[LoanRepo] ⚠️ No se encontró solicitud para ${sender}. Creando una nueva.`);
            const newApplication = await pb.collection(COLLECTION_ID).create({
                telefono: sender,
                estado_solicitud: 'INICIADA', // El primer estado del proceso
            });
            return newApplication;
        }
        console.error(`[LoanRepo] 🔴 Error buscando/creando solicitud:`, error);
        throw error;
    }
}

/**
 * Crea una nueva solicitud de préstamo con datos específicos.
 * @param {object} data Los datos para la nueva solicitud.
 * @returns {Promise<object>} La nueva solicitud creada.
 */
async function createLoan(data) {
    console.log(`[LoanRepo] ✨ Creando nueva solicitud con: ${JSON.stringify(data)}`);
    try {
        const newApplication = await pb.collection(COLLECTION_ID).create(data);
        return newApplication;
    } catch (error) {
        console.error(`[LoanRepo] 🔴 Error creando solicitud:`, error);
        throw error;
    }
}
/**
 * Busca una solicitud de préstamo por el número de teléfono de contacto.
 * @param {string} telefono - El número de teléfono a buscar.
 * @returns {Promise<object|null>} El registro de la solicitud o null si no se encuentra.
 */
async function findByTelefono(telefono) {
    if (!telefono) return null; // No buscar si no hay teléfono
    try {
        console.log(`[LoanRepo] 🔎 Buscando solicitud por Teléfono: ${telefono}`);
        // Asegúrate de que el campo en PocketBase se llame exactamente 'telefono_contacto'
        const application = await pb.collection(COLLECTION_ID).getFirstListItem(`telefono = "${telefono}"`);
        return application;
    } catch (error) {
        if (error.status === 404) {
            return null; // No encontrado
        }
        console.error(`[LoanRepo] 🔴 Error buscando por Teléfono:`, error);
        throw error;
    }
}
/**
 * Actualiza una solicitud de préstamo con nuevos datos.
 * @param {string} id El ID del registro de la solicitud.
 * @param {object} data Los campos a actualizar.
 * @returns {Promise<object>} La solicitud actualizada.
 */
async function updateLoanApplication(id, data) {
    console.log(`[LoanRepo] 📝 Actualizando solicitud ${id} con: ${JSON.stringify(data)}`);
    const updatedApplication = await pb.collection(COLLECTION_ID).update(id, data);
    return updatedApplication;
}

module.exports = {
    findOrCreateLoanApplication,
    createLoan,
    updateLoanApplication,findByTelefono
};