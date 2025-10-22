// /repositories/phoneRepository.js

const pb = require('../config/pocketbaseClient'); // Adjust path to your PocketBase client setup

// IMPORTANT: Replace 'YOUR_COLLECTION_ID_OR_NAME' with the actual ID or Name
// of your PocketBase collection where you store these records.
const COLLECTION_NAME = 'solicitudes_prestamo'; 

/**
 * Finds a record by the 'telefono_contacto' field.
 * @param {string} telefono - The phone number to search for.
 * @returns {Promise<object|null>} The found record object or null if not found.
 */
async function findByTelefono(telefono) {
    if (!telefono) return null;
    try {
        console.log(`[PhoneRepo] 🔎 Searching for record with phone: ${telefono}`);
        // Ensure 'telefono_contacto' is the exact field name in your PocketBase collection
        const record = await pb.collection(COLLECTION_NAME).getFirstListItem(`telefono= "${telefono}"`);
        console.log(`[PhoneRepo] ✅ Record found by phone ${telefono} (ID: ${record.id})`);
        return record;
    } catch (error) {
        if (error.status === 404) {
            console.log(`[PhoneRepo] ❌ Record not found for phone: ${telefono}`);
            return null; // Not found is not an error in this context
        }
        console.error(`[PhoneRepo] 🔴 Error finding by phone (${telefono}):`, error);
        throw error; // Re-throw other errors
    }
}

/**
 * Creates a new record in the collection.
 * @param {object} data - The data for the new record (e.g., { telefono_contacto: '123' }).
 * @returns {Promise<object>} The newly created record object.
 */
async function createRecord(data) {
    try {
        console.log(`[PhoneRepo] ✨ Creating new record with data:`, data);
        const newRecord = await pb.collection(COLLECTION_NAME).create(data);
        console.log(`[PhoneRepo] ✅ Record created successfully (ID: ${newRecord.id})`);
        return newRecord;
    } catch (error) {
        console.error(`[PhoneRepo] 🔴 Error creating record:`, error);
        throw error;
    }
}

/**
 * Updates an existing record identified by its phone number.
 * Note: This requires finding the record ID first.
 * @param {string} telefono - The phone number identifying the record to update.
 * @param {object} dataToUpdate - An object containing the fields and new values to update.
 * @returns {Promise<object|null>} The updated record object or null if the record wasn't found.
 */
async function updateRecordByTelefono(telefono, dataToUpdate) {
    try {
        console.log(`[PhoneRepo] 🔄 Attempting to update record for phone: ${telefono}`);
        // 1. Find the record ID using the phone number
        const existingRecord = await findByTelefono(telefono);

        if (!existingRecord) {
            console.log(`[PhoneRepo] ⚠️ Cannot update. Record not found for phone: ${telefono}`);
            return null; // Indicate that the record to update wasn't found
        }

        // 2. Update the record using its ID
        console.log(`[PhoneRepo] 📝 Updating record ID: ${existingRecord.id} with data:`, dataToUpdate);
        const updatedRecord = await pb.collection(COLLECTION_NAME).update(existingRecord.id, dataToUpdate);
        console.log(`[PhoneRepo] ✅ Record ID: ${existingRecord.id} updated successfully.`);
        return updatedRecord;

    } catch (error) {
        console.error(`[PhoneRepo] 🔴 Error updating record by phone (${telefono}):`, error);
        throw error;
    }
}


module.exports = {
    findByTelefono,
    createRecord,
    updateRecordByTelefono
};