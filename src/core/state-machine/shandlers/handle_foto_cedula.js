// /stateHandlers/handle_foto_cedula.js
async function handle(solicitud) {
    return { next_message: "Ahora necesito que me envíes una foto de la parte frontal y otra de la parte trasera de tu cédula." };
}
module.exports = { handle };