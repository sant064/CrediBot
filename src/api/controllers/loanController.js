// /controllers/loanController.js

const loanRepository = require('../../repositories/loanRepository');
const intelligenceService = require('../../services/intelligenceService');
const stateHandlers = require('../../core/state-machine/shandlers/');
const loanFsmConfig = require('../../core/fsm-configs/loan.config');

// Mapeo del nombre del handler al estado de la solicitud en la BBDD
// NOTA: Esto idealmente debería estar en loanFsmConfig o un archivo de constantes, pero lo dejamos aquí para la lógica del controlador.
const handlerToStateMap = {
    'handle_pedir_cedula': 'ESPERANDO_CEDULA',
    'handle_preguntar_empresa': 'ESPERANDO_EMPRESA',
    'handle_ciudad_barrio_persona': 'ESPERANDO_CIUDAD_BARRIO',
    'handle_referencias_personales': 'ESPERANDO_REFERENCIAS',
    'handle_pedir_monto': 'ESPERANDO_MONTO',
    'handle_foto_cedula': 'ESPERANDO_FOTO_CEDULA',
    'handle_finalizar_solicitud': 'FINALIZADO',
    'handle_rechazado_moroso': 'RECHAZADO_MOROSO',
    'handle_repetir_pregunta_deuda': 'ESPERANDO_RESPUESTA_DEUDA', // Se mantiene el estado si repetimos
    // Asegúrate de añadir mapeos para todos tus handlers aquí
};

const processDataCollectionStep = async (req, res) => {
    console.log('=============================================');
    console.log('[LoanController] ⚡ Procesando paso de recolección de datos...');
    
    try {
        const { sender, message } = req.body;
        console.log(`[LoanController] ➡️ Petición recibida: sender=${sender}, message="${message}"`);
        console.log(req.body);

        console.log(`[LoanController] 🔍 Buscando o creando solicitud para sender: ${sender}`);
        let solicitud = await loanRepository.findOrCreateLoanApplication(sender); // Usamos 'let' para reasignar después de la actualización
        console.log(`[LoanController] 📄 Solicitud obtenida. ID: ${solicitud.id}, Estado Actual: ${solicitud.estado_solicitud}, Datos iniciales:`, solicitud);

        let datos_extraidos = {};
        let siguiente_handler;

        // Lógica para determinar el siguiente handler
        if (solicitud.estado_solicitud === 'INICIADA') {
            console.log('[LoanController] 🚦 Estado detectado: INICIADA. Saltando IA y usando handler inicial.');
            siguiente_handler = loanFsmConfig.initialState; // Asume que 'initialState' contiene el nombre del primer handler.
            console.log(`[LoanController] ➡️ Siguiente handler definido (INICIADA): "${siguiente_handler}"`);
            // Nota: Aquí 'datos_extraidos' permanece vacío.
        } else {
            console.log('[LoanController] 🧠 Estado NO INICIADA. Consultando servicio de inteligencia...');
            const intelligenceResult = await intelligenceService.processStep({
                config: loanFsmConfig,
                currentState: solicitud,
                message: message
            });
            datos_extraidos = intelligenceResult.datos_extraidos;
            siguiente_handler = intelligenceResult.siguiente_handler;
            console.log(`[LoanController] 🧠 Resultado IA: datos_extraidos=`, datos_extraidos, `siguiente_handler="${siguiente_handler}"`);
        }
        
        // --- ¡ACTUALIZACIÓN CRÍTICA DEL ESTADO AQUÍ! ---
        let updates = { ...datos_extraidos };
        const nuevoEstado = handlerToStateMap[siguiente_handler];

        if (nuevoEstado && nuevoEstado !== solicitud.estado_solicitud) {
            updates.estado_solicitud = nuevoEstado; // Añadimos el nuevo estado a las actualizaciones
            console.log(`[LoanController] 🔄 Transición de estado: ${solicitud.estado_solicitud} -> ${nuevoEstado}`);
        } else if (nuevoEstado) {
            console.log(`[LoanController] ℹ️ Estado ${solicitud.estado_solicitud} se mantiene. Nuevo handler: ${siguiente_handler}`);
        } else {
            // Caso de fallback: El handler no está mapeado, se mantiene el estado actual de la solicitud si no hay datos.
            console.warn(`[LoanController] ⚠️ Handler "${siguiente_handler}" NO MAPEADO a un estado conocido. El estado no se actualizará.`);
        }

        // Si hay datos extraídos O un nuevo estado, actualizamos la BBDD
        if (Object.keys(updates).length > 0) {
            console.log(`[LoanController] 💾 Actualizando BBDD antes del handler:`, updates);
            // Actualizamos la base de datos y reasignamos la variable 'solicitud' con la versión más fresca.
            solicitud = await loanRepository.updateLoanApplication(solicitud.id, updates);
            console.log(`[LoanController] ✅ BBDD actualizada. Nuevo estado: ${solicitud.estado_solicitud}`);
        } else {
            console.log('[LoanController] ℹ️ No se extrajeron datos significativos ni cambio de estado aplica antes del handler.');
        }
        // --- FIN DE LA ACTUALIZACIÓN CRÍTICA ---

        // Buscamos el handler adecuado para el siguiente paso.
        console.log(`[LoanController] 🎯 Intentando encontrar handler para: "${siguiente_handler}"`);
        const handler = stateHandlers[siguiente_handler];

        let response;
        if (handler) {
            console.log(`[LoanController] ✅ Handler encontrado: "${siguiente_handler}".`);
            // Pasamos la solicitud ya actualizada (y posiblemente con el nuevo estado) al handler.
            console.log(`[LoanController] 🚀 Llamando handler "${siguiente_handler}" con solicitud actualizada...`);
            response = await handler.handle(solicitud); 
            console.log(`[LoanController] ✅ Handler "${siguiente_handler}" completado. Respuesta:`, response);
        } else {
            console.warn(`[LoanController] ⚠️ NO SE ENCONTRÓ HANDLER para el estado: "${siguiente_handler}". Usando respuesta de fallback.`);
            response = { next_message: "Estamos procesando tu información. Un agente se pondrá en contacto contigo en breve." };
        }
        
        // Enviamos la respuesta final al usuario.
        if (response && !response.async_process_running) {
            console.log(`[LoanController] ✅ Enviando respuesta final al usuario: "${response.next_message}"`);
            res.json({ next_message: response.next_message });
        } else if (response && response.async_process_running) {
            console.log(`[LoanController] ⏳ El handler "${siguiente_handler}" inició un proceso asíncrono. No se envía respuesta inmediata.`);
            res.status(202).json({ next_message: "Procesando su solicitud en segundo plano.", async_process: true });
        } else {
            console.error('[LoanController] 🔴 El handler no devolvió una respuesta válida.');
            res.status(500).json({ error: 'Error interno: El handler no generó una respuesta.' });
        }

    } catch (error) {
        console.error('[LoanController] 🔴 ERROR FATAL en processDataCollectionStep:', error);
        console.error('[LoanController] 🚨 Detalles del error:', error.message, error.stack);
        res.status(500).json({ error: 'Error interno del servidor al procesar el paso.' });
    } finally {
        console.log('=============================================');
    }
};

module.exports = { 
    processDataCollectionStep 
};