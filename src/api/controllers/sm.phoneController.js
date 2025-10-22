// /controllers/phoneController.js

const phoneRepository = require('../repositories/sm.phoneRepository'); // Adjust path as needed

/**
 * GET Endpoint: Retrieves a record by phone number.
 * If the record doesn't exist, it creates a new one with the phone number.
 */
const getOrCreateRecordByPhone = async (req, res) => {
    console.log('--- GET/CREATE Request ---');
    try {
        const { telefono } = req.params;

        if (!telefono) {
            return res.status(400).json({ error: 'Phone number is required in the URL.' });
        }

        console.log(`Searching for phone: ${telefono}`);
        let record = await phoneRepository.findByTelefono(telefono);

        if (record) {
            console.log(`Record found: ${record.id}`);
            res.status(200).json(record); // Found
        } else {
            console.log(`Record not found. Creating new one for: ${telefono}`);
            const newData = { telefono: telefono }; // Or whatever your phone field is called
            const newRecord = await phoneRepository.createRecord(newData);
            console.log(`Record created: ${newRecord.id}`);
            res.status(201).json(newRecord); // Created
        }

    } catch (error) {
        console.error('Error in getOrCreateRecordByPhone:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

/**
 * PATCH Endpoint: Updates specific fields of an existing record identified by phone number.
 */
const updateRecordByPhone = async (req, res) => {
    console.log('--- UPDATE Request ---');
    try {
        const { telefono } = req.params;
        const fieldsToUpdate = req.body;

        if (!telefono) {
            return res.status(400).json({ error: 'Phone number is required in the URL.' });
        }
        
        // --- CAMBIO AQUÍ ---
        // Si no hay campos para actualizar, responde { data: false }
        if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
            console.log(`[updateRecordByPhone] No update data provided for: ${telefono}`);
            return res.status(200).json({ NoData: true }); // Cambio solicitado
        }
        // --- FIN DEL CAMBIO ---

        console.log(`Attempting to update record for phone: ${telefono} with data:`, fieldsToUpdate);
        
        // We assume the repository handles finding and updating in one go or separately
        const updatedRecord = await phoneRepository.updateRecordByTelefono(telefono, fieldsToUpdate);

        if (!updatedRecord) {
            console.log(`Record not found for update: ${telefono}`);
            return res.status(444).json({ error: 'Record not found for the provided phone number.' });
        }

        console.log(`Record updated successfully: ${updatedRecord.id}`);
        res.status(200).json(updatedRecord); // OK

    } catch (error) {
        console.error('Error in updateRecordByPhone:', error);
        res.status(500).json({ error: 'Internal server error during update.' });
    }
};

module.exports = {
    getOrCreateRecordByPhone,
    updateRecordByPhone
};