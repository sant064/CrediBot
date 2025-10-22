// /services/intelligenceService.js (Solo la función processStep)

const aiService = require('./aiService');

async function processStep({ config, currentState, message }) {
    console.log(`[IntelligenceService] 🧠 Procesando paso... Estado actual: ${currentState.estado_solicitud}`);

    if (currentState.estado_solicitud === 'FINALIZADO') {
        return { datos_extraidos: {}, siguiente_handler: config.alreadyFinishedHandler };
    }

    let datos_extraidos = {};
    let siguiente_handler;

    // --- ¡NUEVA LÓGICA DE PRIORIDAD DE ESTADO! ---
    if (currentState.estado_solicitud === 'ESPERANDO_RESPUESTA_DEUDA') {
        const tieneDeuda = await aiService.analyzeYesNo(message);
        console.log(`[IntelligenceService] 💬 Resultado analyzeYesNo: ${tieneDeuda}`); // <--- AÑADIDO LOG CLAVE

        if (tieneDeuda === true) {
            // ✅ CORRECCIÓN 1: Establecer datos_extraidos y el handler de rechazo
            datos_extraidos = { tiene_deuda_atrasada: true };
            siguiente_handler = 'handle_rechazado_moroso'; // Estado final si tiene deuda

        } else if (tieneDeuda === false) {
            // Caso: Respuesta NO
            datos_extraidos = { tiene_deuda_atrasada: false }; 
            
            // Intentamos extraer del mensaje "no..."
            const extractedFromNo = await aiService.extractDataFromMessage(message, currentState);
            datos_extraidos = { ...datos_extraidos, ...extractedFromNo };

            const datos_actualizados = { ...currentState, ...datos_extraidos }; 
            
            siguiente_handler = config.finalHandler; 
            for (const step of config.dataCollectionOrder) {
                const isMissingFunction = config.fieldCheckers[step];
                if (isMissingFunction && isMissingFunction(datos_actualizados)) {
                    siguiente_handler = config.handlerMapping[step];
                    break; 
                }
            }
        } else {
            // Caso: La IA no entendió el sí/no (incluye mensajes como "hoal", "." o respuestas ambiguas).
            console.warn('[IntelligenceService] ⚠️ IA no pudo interpretar el Sí/No. Repitiendo pregunta.');
            siguiente_handler = 'handle_repetir_pregunta_deuda'; 
        }
    } else {
        // --- LÓGICA ORIGINAL (PARA TODOS LOS DEMÁS ESTADOS) ---
        datos_extraidos = await aiService.extractDataFromMessage(message, currentState);
        const datos_actualizados = { ...currentState, ...datos_extraidos };

        siguiente_handler = config.finalHandler;
        for (const step of config.dataCollectionOrder) {
            const isMissingFunction = config.fieldCheckers[step];
            if (isMissingFunction && isMissingFunction(datos_actualizados)) {
                siguiente_handler = config.handlerMapping[step];
                break; 
            }
        }
    }
    // ------------------------------------------

    console.log(`[IntelligenceService] 🎯 Próximo handler determinado: ${siguiente_handler}`);
    return { datos_extraidos, siguiente_handler };
}

module.exports = { processStep };