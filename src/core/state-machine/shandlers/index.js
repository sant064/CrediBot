// /stateHandlers/index.js

// Mapeamos el nombre del handler (que viene del intelligenceService) al archivo especialista que lo maneja.
const handlers = {
    
    'handle_iniciar_conversacion': require('./handle_iniciar_conversacion'),
    'handle_pedir_cedula': require('./handle_pedir_cedula'),
    'handle_preguntar_empresa': require('./handle_preguntar_empresa'),
    'handle_ciudad_barrio_persona': require('./handle_pedir_ciudad_persona'),
    'handle_referencias_personales': require('./handle_referencias_personales'),
    'handle_pedir_monto': require('./handle_pedir_monto'),
    'handle_foto_cedula': require('./handle_foto_cedula'),
    'handle_finalizar_solicitud': require('./handle_finalizar_solicitud'),
    'handle_ya_finalizado': require('./handle_ya_finalizado'),
    
    // 💥 NUEVO HANDLER AÑADIDO PARA LA LÓGICA DE RECHAZO
    'handle_rechazado_moroso': require('./handle_rechazado_moroso'), 

    // También necesitarás este handler que ya usas en intelligenceService.js
    'handle_repetir_pregunta_deuda': require('./handle_repetir_pregunta_deuda'), 
};

module.exports = handlers;