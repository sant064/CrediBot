// /stateHandlers/handleRechazadoMoroso.js

const handleRechazadoMoroso = {
    async handle(solicitud) {
        console.log(`[Handler: RechazadoMoroso] Procesando rechazo por deuda para solicitud ID: ${solicitud.id}`);
        
        const rejectionMessage = "Lamentamos informarte que, debido a que el sistema detectó que actualmente posees deudas atrasadas en otras entidades, no podemos continuar con tu solicitud de préstamo en este momento. Agradecemos tu interés.";

        // No hay más estados después de este, por lo que no se requiere ninguna acción de BBDD aquí
        
        return { 
            next_message: rejectionMessage 
            // no se requiere async_process_running a menos que se notifique a un agente
        };
    }
};

module.exports = handleRechazadoMoroso;