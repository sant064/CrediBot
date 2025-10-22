// /stateHandlers/handle_ciudad_barrio_persona.js
async function handle(solicitud) {
    return { next_message: "Muy bien. Ahora, por favor, dime en qué ciudad y barrio vives." };
}
module.exports = { handle };