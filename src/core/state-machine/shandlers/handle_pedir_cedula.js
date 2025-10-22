// /stateHandlers/handle_pedir_cedula.js
async function handle(solicitud) {
    return { next_message: "Entendido. Para comenzar, por favor, envíame tu número de cédula." };
}
module.exports = { handle };