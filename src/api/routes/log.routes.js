// /routes/log.routes.js

const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/chat', logController.logChatMessage);
router.get('/', logController.getAllChats);

// --- ¡ESTA LÍNEA ES CRUCIAL! ---
// Si falta, la variable 'logRoutes' en index.js estará vacía y causará el error.
module.exports = router;