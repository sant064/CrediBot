// /controllers/aiController.js

const axios = require('axios');

const generateResponse = async (req, res) => {
  console.log('=============================================');
  console.log('[AIController] ⚡ Petición RECIBIDA para generar respuesta de IA');
  
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    console.log(`[AIController] 💬 Mensaje del usuario: "${userMessage}"`);
    console.log(`[AIController] 🧠 Contactando a Ollama en: ${process.env.OLLAMA_API_URL}`);

    // --- LÓGICA ACTUALIZADA (la que ya probaste) ---
    const payload = {
      model: "phi3:mini", // O el modelo que prefieras
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      stream: false
    };

    const ollamaResponse = await axios.post(process.env.OLLAMA_API_URL, payload);
    const aiMessage = ollamaResponse.data.message.content;
    
    console.log(`[AIController] ✅ Respuesta de la IA: "${aiMessage}"`);
    res.status(200).json({ response: aiMessage });

  } catch (error) {
    console.error('[AIController] 🔴 Error al contactar con Ollama:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error interno al generar la respuesta de la IA.' });
  }
};

module.exports = {
  generateResponse,
};