// /routes/ai.routes.js

const express = require('express');
const router = express.Router();

// Importamos al "experto" que sabe cómo hablar con la IA
const aiController = require('../controllers/aiController');

// Definimos la ruta específica.
// Le decimos al router: "Cuando llegue una petición POST a '/chat'..."
// "...ejecuta la función 'generateResponse' que está en el aiController."
router.post('/chat', aiController.recognizeIntent);

// Exportamos el mapa de rutas para que index.js pueda usarlo
module.exports = router;