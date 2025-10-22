// /stateHandlers/handle_pedir_barrio_persona.js

const handlePedirBarrioPersona = {
    async handle(solicitud) {
        console.log(`[Handler: PedirBarrio] ❓ Solicitando barrio a solicitud ID: ${solicitud.id}`);
        
        return { 
            next_message: "¿Podrías indicarme ahora el nombre de tu **barrio** o sector de residencia?"
        };
    }
};

module.exports = handlePedirBarrioPersona;