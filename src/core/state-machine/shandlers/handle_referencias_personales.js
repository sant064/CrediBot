// /stateHandlers/handle_referencias_personales.js
async function handle(solicitud) {
    return { next_message: "Ya casi terminamos. Por favor, envíame 3 referencias personales (nombre y teléfono si es posible)." };
}
module.exports = { handle };