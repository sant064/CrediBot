// /stateHandlers/handle_ya_finalizado.js
async function handle(solicitud) {
    return { next_message: "Hola de nuevo. Tu solicitud ya fue enviada para análisis. Un agente te contactará en breve. Si tienes otra consulta, no dudes en preguntar." };
}
module.exports = { handle };