// /controllers/configController.js

const configRepository = require('../../repositories/configRepository');

const getConfigByKey = async (req, res) => {
   
  
  try {
    const { key } = req.params; // Obtenemos la clave de la URL (ej: /api/config/GREETING_MSG_1)
    const value = await configRepository.getValueByKey(key);

    if (value) {
       
      // Si encontramos el valor, lo devolvemos en un JSON.
      res.status(200).json({ key: key, value: value });
    } else {
      console.log(`[ConfigController] ⚠️ No se encontró valor para "${key}". Enviando error 404.`);
      // Si el repositorio devolvió null, enviamos un error 404 (No Encontrado).
      res.status(404).json({ error: `Configuración con clave "${key}" no encontrada.` });
    }
  } catch (error) {
    console.error('[ConfigController] 🔴 Error al procesar la petición:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { 
  getConfigByKey 
};