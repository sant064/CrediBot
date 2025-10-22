// /controllers/aiController.js

// 1. Importamos nuestro cerebro de IA, no la librería de Google directamente.
const aiService = require('../../services/aiService');

/**
 * Endpoint para reconocer la intención de un mensaje de usuario.
 * Actúa como un orquestador: recibe la petición y delega el trabajo a aiService.
 */
const recognizeIntent = async (req, res) => {
    console.log('=============================================');
    console.log('[AIController] ⚡ Petición RECIBIDA para reconocer intención');

    try {
        const userMessage = req.body.message;

        // 2. Validación de entrada simple.
        if (!userMessage) {
            return res.status(400).json({ error: 'El campo "message" es requerido.' });
        }

        console.log(`[AIController] 🧠 Llamando a aiService con el mensaje: "${userMessage}"`);

        // 3. Delegamos TODO el trabajo pesado a nuestro servicio especializado.
        const finalIntent = await aiService.recognizeIntent(userMessage);

        console.log(`[AIController] ✅ Intención final reconocida: "${finalIntent}"`);
        
        // 4. Devolvemos el resultado limpio.
        res.status(200).json({ intent: finalIntent });
        
    } catch (error) {
        console.error('[AIController] 🔴 Error procesando la intención:', error);
        res.status(500).json({ error: 'Error interno del servidor al reconocer la intención.' });
    }
};

module.exports = {
    // Renombramos la función para que sea más descriptiva.
    recognizeIntent 
};