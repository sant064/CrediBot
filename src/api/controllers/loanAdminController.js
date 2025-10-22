// /controllers/loanAdminController.js

const loanRepository = require('../../repositories/loanRepository');

/**
 * Crea una nueva solicitud de préstamo.
 */
const createLoanApplication = async (req, res) => {
    console.log('=============================================');
    console.log('[LoanAdminController] ✨ Creando una nueva solicitud de préstamo...');
    try {
        const loanData = req.body;
        if (!loanData || Object.keys(loanData).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron datos para crear el préstamo.' });
        }
        const newLoan = await loanRepository.createLoan(loanData);
        console.log(`[LoanAdminController] ✅ Solicitud creada exitosamente con ID: ${newLoan.id}`);
        res.status(201).json(newLoan);
    } catch (error) {
        console.error('[LoanAdminController] 🔴 Error creando la solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * Actualiza campos específicos de una solicitud de préstamo existente.
 */
const updateLoanFields = async (req, res) => {
    console.log('=============================================');
    console.log('[LoanAdminController] 🔄 Actualizando campos de una solicitud...');
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Falta el ID de la solicitud en la URL.' });
        }
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
        }
        const updatedLoan = await loanRepository.updateLoanApplication(id, fieldsToUpdate);
        if (!updatedLoan) {
            return res.status(404).json({ error: 'Solicitud no encontrada.' });
        }
        console.log(`[LoanAdminController] ✅ Solicitud ${id} actualizada exitosamente.`);
        res.json(updatedLoan);
    } catch (error) {
        console.error('[LoanAdminController] 🔴 Error actualizando la solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
/**
 * Crea una nueva solicitud si no existe (basado en telefono), o actualiza la existente.
 */
const createOrUpdateLoanApplication = async (req, res) => {
    console.log('=============================================');
    console.log('[LoanAdminController] ✨🔄 Procesando Upsert de Solicitud por Teléfono...');

    try {
        const loanData = req.body;

        if (!loanData || !loanData.telefono) { // Aseguramos que el teléfono venga
            return res.status(400).json({ error: 'Faltan datos o el campo telefono.' });
        }

        const telefono = loanData.telefono;
        let existingLoan = await loanRepository.findByTelefono(telefono);

        if (existingLoan) {
            // --- ACTUALIZAR ---
            console.log(`[LoanAdminController] 🔄 Solicitud encontrada (ID: ${existingLoan.id}). Actualizando...`);
            // Excluimos el ID y el teléfono (que no cambia) de los datos a actualizar
            const { id, telefono, ...updateData } = loanData; 
            const updatedLoan = await loanRepository.updateLoanApplication(existingLoan.id, updateData);
            console.log(`[LoanAdminController] ✅ Solicitud ${existingLoan.id} actualizada.`);
            res.status(200).json(updatedLoan); // OK
        } else {
            // --- CREAR ---
            console.log(`[LoanAdminController] ✨ No se encontró solicitud para ${telefono}. Intentando crear...`);
            const dataToCreate = { estado_solicitud: 'INICIADA', ...loanData };
            const newLoan = await loanRepository.createLoan(dataToCreate);
            console.log(`[LoanAdminController] ✅ Solicitud creada con ID: ${newLoan.id}`);
            res.status(201).json(newLoan); // Created
        }

    } catch (error) {
        console.error('[LoanAdminController] 🔴 Error en Upsert:', error);

        // --- MANEJO MEJORADO DEL ERROR DE DUPLICADO ---
        // Verificamos si el error es específicamente por el campo 'telefono' único
        if (error.status === 400 && error.response?.data?.telefono?.code === 'validation_not_unique') {
             console.warn(`[LoanAdminController] ⚠️ Conflicto: Intento de crear solicitud con teléfono duplicado: ${loanData.telefono}`);
             return res.status(409).json({ // 409 Conflict es el código HTTP correcto para esto
                 error: 'Conflicto: Ya existe una solicitud con este número de teléfono.',
                 code: 'TELEFONO_DUPLICADO' 
             });
        }
        // ----------------------------------------------

        // Para cualquier otro error, devolvemos un 500 genérico
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * Verifica si un teléfono ya existe en la base de datos.
 * Responde con { exists: true } o { exists: false }.
 */
const checkTelefonoExists = async (req, res) => {
    console.log('=============================================');
    console.log('[LoanAdminController] ❓ Verificando existencia de Teléfono...');

    try {
        // Obtenemos el teléfono desde los parámetros de la URL (ej: /prestamos/telefono/595981...)
        const { telefono } = req.params; // <-- Cambiado de cedula a telefono

        if (!telefono) {
            return res.status(400).json({ error: 'Falta el número de teléfono en la URL.' });
        }

        console.log(`[LoanAdminController] 🔍 Buscando teléfono: ${telefono}`);
        // Usamos la función findByTelefono del repositorio
        const existingLoan = await loanRepository.findByTelefono(telefono); // <-- Cambiado de findByCedula a findByTelefono

        if (existingLoan) {
            console.log(`[LoanAdminController] ✅ Teléfono ${telefono} encontrado.`);
            res.status(200).json({ exists: true });
        } else {
            console.log(`[LoanAdminController] ❌ Teléfono ${telefono} no encontrado.`);
            res.status(200).json({ exists: false });
        }

    } catch (error) {
        console.error('[LoanAdminController] 🔴 Error verificando teléfono:', error);
        res.status(500).json({ error: 'Error interno del servidor al verificar el teléfono.' });
    }
};
module.exports = {
    createLoanApplication,
    updateLoanFields, createOrUpdateLoanApplication,
   checkTelefonoExists
};