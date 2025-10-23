// /controllers/whatsappController.js

const axios = require('axios');

const sendMessage = async (req, res) => {
 // console.log('=============================================');
 // console.log('[WhatsAppController] ⚡ Petición RECIBIDA para enviar mensaje genérico');

  try {
    const { apikey, sender, instanceId, message } = req.body;
console.log(req.body)
    if (!sender || !instanceId || !message) {
      return res.status(400).json({ error: 'Los campos "sender", "instanceId" y "message" son requeridos.' });
    }

    // La URL de la API es correcta
    const apiUrl = `${process.env.EVOLUTION_API_URL}/message/sendText/${instanceId}`;
    //console.log(`[WhatsAppController] 🌐 URL de la API: ${apiUrl}`);

    // --- CORRECCIÓN IMPORTANTE AQUÍ ---
    // El payload debe ser un objeto simple, tal como lo espera el endpoint "sendText".
    const payload = {
      number: sender.split('@')[0],
      text: message // El campo se llama "text", no "textMessage" anidado.
    };

    console.log(`[WhatsAppController] 📤 Enviando payload a Evolution: ${JSON.stringify(payload)}`);
    
    await axios.post(apiUrl, payload, {
        headers: {
            'apikey': apikey,
            'Content-Type': 'application/json'
        }
    });

    res.status(200).json({ success: true, message: 'Mensaje genérico enviado.' });

  } catch (error) {
    console.error('[WhatsAppController] 🔴 Error al enviar mensaje genérico:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error interno al enviar el mensaje de WhatsApp.' });
  }
};

module.exports = {
  sendMessage,
};  