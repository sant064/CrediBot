// /routes/session.routes.js

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Ruta para obtener/crear y actualizar el estado de una sesión
router.get('/:sender', sessionController.getSessionState);

// Ruta para que la IA reconozca y guarde la intención
router.post('/recognize', sessionController.recognizeIntent);

router.post('/updateState', sessionController.updateSessionState); // <--- TU ENDPOINT

module.exports = router;