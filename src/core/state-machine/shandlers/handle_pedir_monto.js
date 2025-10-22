// /stateHandlers/handle_pedir_monto.js
async function handle(solicitud) {
    return { next_message: "¡Perfecto! Para finalizar, por favor, indícame el monto que te gustaría solicitar." };
}
module.exports = { handle };