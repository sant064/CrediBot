// /stateHandlers/handle_preguntar_empresa.js
async function handle(solicitud) {
    return { next_message: "Gracias. Ahora, por favor, dime el nombre de la empresa donde trabajas." };
}
module.exports = { handle };