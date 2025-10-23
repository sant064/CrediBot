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
    //    (Asegúrate de que estas variables estén en tu Easypanel)
    const targetUrl = process.env.mkp_N8N_URL;
    const nodeServer = process.env.NODE_SERVER; // <-- NUEVA LÍNEA
    const apikey = process.env.API_KEY;         // <-- NUEVA LÍNEA

    // 2b. Validar TODAS las variables de entorno requeridas
    if (!targetUrl || !nodeServer || !apikey) {
      console.error('[MKPController] 🔴 ¡Error! Variables de entorno faltantes. Asegúrate de definir mkp_N8N_URL, NODE_SERVER y API_KEY.');
      return res.status(500).json({ error: 'Configuración del servidor incompleta.' });
    }

    // 3. Preparar el payload para enviar a n8n (con los nuevos datos)
    const payload = {
      sender: sender,
      message: message,
      nodeserver: nodeServer, // <-- NUEVA LÍNEA
      apikey: apikey          // <-- NUEVA LÍNEA
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
};