// /routes/instance.routes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/phone/:telefono/status', chatController.getInstanceStatusByTelefono);

// --- ¡ESTA LÍNEA TAMBIÉN ES CRUCIAL! ---
module.exports = router;