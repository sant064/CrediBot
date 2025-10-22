// /stateHandlers/handle_ciudad_persona.js (Anteriormente handle_ciudad_barrio_persona)

const handleCiudadPersona = {
    async handle(solicitud) {
        console.log(`[Handler: PedirCiudad] ❓ Solicitando ciudad a solicitud ID: ${solicitud.id}`);
        
        return { 
            next_message: "Necesito saber tu **ciudad** de residencia para continuar. ¿Cuál es?"
        };
    }
};

module.exports = handleCiudadPersona;