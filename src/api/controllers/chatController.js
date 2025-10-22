// /controllers/chatController.js

const chatService = require('../../services/chatService');

const getInstanceStatusByTelefono = async (req, res) => {
  // Nuestros logs para saber que la petición llegó
  console.log('=============================================');
  console.log('[Controller] ⚡ Petición RECIBIDA en getInstanceStatusByTelefono');
  const { telefono } = req.params;
  console.log(`[Controller] Teléfono recibido: ${telefono}`);
  
  try {
    // Llamamos al Ingeniero (al servicio) para que haga su trabajo
    const result = await chatService.checkInstanceStatusByTelefono(telefono);
    
    // El 'result' que viene del servicio es un objeto como { success: true, status: '...' }
    // O { success: false, ... }

    // ¡ESTA PARTE ES LA MÁS IMPORTANTE!
    // Aquí es donde enviamos la respuesta de vuelta.
    if (result && result.success) {
      console.log(`[Controller] ✅ Petición exitosa. Enviando respuesta: ${JSON.stringify({ status: result.status })}`);
      // Si todo fue bien, enviamos un status 200 y el JSON con el resultado.
      res.status(200).json({ status: result.status });
    } else {
      console.log(`[Controller] ⚠️ Petición fallida o no encontrada. Enviando respuesta de error.`);
      // Si el servicio nos dice que no fue exitoso, enviamos un error.
      // Usamos 404 para "no encontrado".
      res.status(404).json({ status: result.status || 'no_encontrado' });
    }
  } catch (error) {
    console.error('[Controller] 🔴 Error CATASTRÓFICO en el controlador:', error);
    // Es CRUCIAL enviar una respuesta incluso si todo falla.
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  getInstanceStatusByTelefono,
};