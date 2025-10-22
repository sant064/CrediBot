// /controllers/sessionController.js

const sessionRepository = require('../../repositories/sessionRepository');
const aiService = require('../../services/aiService'); // <-- ¡NUEVA IMPORTACIÓN!

const getSessionState = async (req, res) => {
    try {
        const { sender } = req.params;
        const session = await sessionRepository.findOrCreateSession(sender);
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Error al gestionar la sesión.', details: error.message });
    }
};

const recognizeIntent = async (req, res) => {
    try {
        const { userMessage, sessionId } = req.body;

        if (!userMessage || !sessionId) {
            return res.status(400).json({ error: 'userMessage y sessionId son requeridos.' });
        }

        console.log(`[SessionController] 🧠 Reconociendo intención para el mensaje: "${userMessage}"`);

        // --- ¡LÓGICA DE IA REFACTORIZADA! ---
        // El controlador ya no sabe cómo funciona la IA, solo la llama.
        const finalIntent = await aiService.recognizeIntent(userMessage);
        // ------------------------------------
        
        console.log(`[SessionController] ✅ Intención reconocida (final): "${finalIntent}"`);

        const updatedSession = await sessionRepository.updateIntent(sessionId, finalIntent); 
        
        res.status(200).json(updatedSession);

    } catch (error) {
        console.error('[SessionController] 🔴 Error en el proceso de reconocimiento de intención:', error.message);
        res.status(500).json({ error: 'Error interno al procesar la intención.', details: error.message });
    }
};

const updateSessionState = async (req, res) => {
    try {
        const { sessionId, updateData } = req.body;

        if (!sessionId || !updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'sessionId y updateData son requeridos.' });
        }
        
        //console.log(`[SessionController] 📝 Actualización independiente de sesión ${sessionId} con datos:`, updateData);
        
        const updatedSession = await sessionRepository.updateSessionData(sessionId, updateData); 
        
        res.status(200).json(updatedSession);
        
    } catch (error) {
        console.error('[SessionController] 🔴 Error en updateSessionState:', error.message);
        res.status(500).json({ error: 'Error al actualizar el estado de la sesión.', details: error.message });
    }
}

module.exports = {
    getSessionState,
    recognizeIntent, 
    updateSessionState,
};