// /controllers/whatsappController.js
// (Asegúrate de que axios esté importado)
const axios = require('axios');

const mkpcontroller = async (req, res) => {
  console.log('=============================================');
  console.log('[MKPController] ⚡ Petición RECIBIDA para MKP');

  try {
    // 1. Destructurar los datos de entrada
    const { query } = req.body;
    if (!query || !query.sender || !query.message) {
      console.warn('[MKPController] ⚠️ Payload inválido. Faltan query, sender o message.');
      return res.status(400).json({ error: 'Payload inválido. Se requieren sender y message en el objeto query.' });
    }
    
    const { sender, message } = query;
    console.log('[MKPController] Sender:', sender);
    console.log('[MKPController] Message:', message);

    // 2. Obtener la URL de n8n y las NUEVAS variables del entorno
    const targetUrl = process.env.mkp_N8N_URL;
    const apikey = process.env.mkp_api_key;
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
    const mkp_instanceID = process.env.mkp_instanceID;

    // --- CORRECCIÓN AQUÍ ---
    // Se ha actualizado la validación para que coincida con las variables que realmente usas.

    // 2b. Validar TODAS las variables de entorno requeridas
    if (!targetUrl || !apikey || !EVOLUTION_API_URL || !mkp_instanceID) {
      console.error('[MKPController] 🔴 ¡Error! Variables de entorno faltantes. Asegúrate de definir mkp_N8N_URL, mkp_api_key, EVOLUTION_API_URL y mkp_instanceID.');
      return res.status(500).json({ error: 'Configuración del servidor incompleta.' });
    }
    // --- FIN DE LA CORRECCIÓN ---

    // 2c. Construir la URL de respuesta
    const urlRespuesta = `${EVOLUTION_API_URL}/message/sendText/${mkp_instanceID}`;

    // 3. Preparar el payload para enviar a n8n (con los nuevos datos)
    const payload = {
      sender: sender,
      message: message,
      apikey: apikey,
      evolution_api_url: urlRespuesta // Esta es la URL completa que n8n recibirá
    };

    // 4. Enviar la petición POST a n8n
    console.log(`[MKPController] 📤 Enviando POST a n8n: ${targetUrl}`);
    
    const n8nResponse = await axios.post(targetUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 5. Responder al cliente original con la respuesta de n8n
    console.log(`[MKPController] ✅ n8n respondió con estado: ${n8nResponse.status}`);
    res.status(n8nResponse.status).json(n8nResponse.data);

  } catch (error) {
    // 6. Manejar errores si n8n falla
    console.error('[MKPController] 🔴 Error al contactar n8n:', error.response ? error.response.data : error.message);
    
    // Si n8n devolvió un error (ej. 404, 500), lo reenviamos
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      // Si fue un error de red (ej. no se pudo conectar)
      res.status(500).json({ error: 'Error interno al procesar la solicitud.', details: error.message });
    }
  }
};

module.exports = {
  mkpcontroller,
  // ... (asegúrate de exportar también 'sendMessage' si sigue en este archivo)
};