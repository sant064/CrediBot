// /stateHandlers/handle_iniciar_conversacion.js
const loanRepository = require('../../../repositories/loanRepository');

async function handle(solicitud) {
    // This handler simply asks the first question and updates the state
    const next_message = "¡Hola! Estás iniciando una solicitud de préstamo. Antes de continuar, ¿tienes alguna deuda con atraso actualmente?";
    await loanRepository.updateLoanApplication(solicitud.id, { estado_solicitud: 'ESPERANDO_RESPUESTA_DEUDA' }); // Move to the next state
    return { next_message };
}

module.exports = { handle };