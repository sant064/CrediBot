// /fsm-configs/loan.config.js

const loanFsmConfig = {
    // El orden en que queremos recolectar los datos.
    dataCollectionOrder: [
        'cedula',
        'empresa',
        'ciudad_persona', // 1. Pedir Ciudad
        'barrio_persona', // 2. Pedir Barrio
        'referencias_personales',
        'monto',
        'foto_cedula'
    ],

    // Un mapa que le dice al cerebro cómo saber si un dato falta.
    fieldCheckers: {
        cedula: (state) => !state.cedula,
        empresa: (state) => !state.empresa,
        // ✅ Ahora chequea solo el campo 'ciudad' del estado (solicitud)
        ciudad_persona: (state) => !state.ciudad ,
        // ✅ Nuevo chequeador, chequea solo el campo 'barrio' del estado (solicitud)
        barrio_persona: (state) => !state.barrio ,
        referencias_personales: (state) => !state.referencia_1,
        monto: (state) => !state.monto_solicitado,
        foto_cedula: (state) => !state.foto_cedula_1 || !state.foto_cedula_2
    },

    // Un mapa que le dice al cerebro qué handler llamar para cada dato faltante.
    handlerMapping: {
        cedula: 'handle_pedir_cedula',
        empresa: 'handle_preguntar_empresa',
        
        // ✅ CORREGIDO: Mapea 'ciudad_persona' a un handler que pide la CIUDAD
        ciudad_persona: 'handle_pedir_ciudad_persona', 
        
        // ✅ NUEVO: Mapea 'barrio_persona' a un handler que pide el BARRIO
        barrio_persona: 'handle_pedir_barrio_persona', 
        
        referencias_personales: 'handle_referencias_personales',
        monto: 'handle_pedir_monto',
        foto_cedula: 'handle_foto_cedula'
    },
    
    // El estado de inicio y los estados finales.
    initialState: 'handle_iniciar_conversacion',
    finalHandler: 'handle_finalizar_solicitud',
    alreadyFinishedHandler: 'handle_ya_finalizado'
};

module.exports = loanFsmConfig;