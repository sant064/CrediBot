// /controllers/whatsappController.js

const axios = require('axios');

/**
 * Función de utilidad para crear una pausa (delay).
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Envía un mensaje de texto genérico, simulando "escribiendo" primero.
 */
const sendMessage = async (req, res) => {
  try {
    const { apikey, sender, instanceId, message } = req.body;
    console.log('[WhatsAppController] ⚡ Petición RECIBIDA:', req.body);

    // 1. Validación de entrada (ahora incluye apikey)
    if (!sender || !instanceId || !message || !apikey) {
      return res.status(400).json({ error: 'Los campos "sender", "instanceId", "message" y "apikey" son requeridos.' });
    }

    const apiUrlBase = process.env.EVOLUTION_API_URL;
    const number = sender.split('@')[0];

    // 2. Definir los headers que se usarán en todas las llamadas
    const apiHeaders = {
      'apikey': apikey,
      'Content-Type': 'application/json'
    };

    // --- LÓGICA DE "ESCRIBIENDO" ---

   

    console.log(`[WhatsAppController] 📤 Enviando "escribiendo" a: ${presenceUrl}`);
    await axios.post(presenceUrl, presencePayload, { headers: apiHeaders });

    // 4. Esperar 3 segundos para simular que el bot está escribiendo
    await delay(3000); 

    // --- LÓGICA DE ENVIAR MENSAJE ---

    // 5. Enviar el mensaje de texto
    const messageUrl = `${apiUrlBase}/message/sendText/${instanceId}`;
    const messagePayload = {
      number: number,
      text: message 
    };
    
    console.log(`[WhatsAppController] 📤 Enviando mensaje a: ${messageUrl}`);
    await axios.post(messageUrl, messagePayload, { headers: apiHeaders });

    // 6. Enviar respuesta exitosa
    res.status(200).json({ success: true, message: 'Mensaje genérico enviado.' });

  } catch (error) {
    // 7. Manejo de errores
    console.error('[WhatsAppController] 🔴 Error al enviar mensaje:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error interno al enviar el mensaje de WhatsApp.' });
  }
};

module.exports = {
  sendMessage,
};