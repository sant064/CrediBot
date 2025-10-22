// /controllers/ai.controller.js
const aiService = require('../services/aiExtraer');
const solicitudRepository = require('../repositories/solicitud.repository');

/**
 * Maneja la petición HTTP para extraer datos de un mensaje.
 */
const handleExtractData = async (req, res) => {
  try {
    // El cuerpo de la petición ahora debe incluir el mensaje y el teléfono del usuario
    const { message, telefono } = req.body;

    if (!message || !telefono) {
      return res.status(400).json({ error: 'Faltan los parámetros "message" o "telefono".' });
    }

    // Buscamos el estado actual del usuario para pasárselo a la IA
    const solicitud = await solicitudRepository.findBytelefono(telefono);
    if (!solicitud) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Llamamos al servicio de IA para que haga el trabajo pesado
    const extractedData = await aiService.extractDataFromMessage(message, solicitud);
    
    // Devolvemos los datos extraídos
    res.status(200).json(extractedData);

  } catch (error) {
    console.error('🔴 Error en el controlador de IA:', error);
    res.status(500).json({ error: 'Ocurrió un error interno al procesar la solicitud de IA.' });
  }
};

module.exports = {
  handleExtractData,
};