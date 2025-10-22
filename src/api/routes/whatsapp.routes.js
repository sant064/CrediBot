// /routes/whatsapp.routes.js

const express = require('express');
const router = express.Router();

// 1. Import AMBAS funciones que el controlador tendrá.
const {  sendMessage } = require('../controllers/whatsappController');

// Ruta existente para pedir la cédula
// Se activa con: POST /api/whatsapp/ask-for-id


// 2. --- RUTA NUEVA ---
// Se activa con: POST /api/whatsapp/send-message
router.post('/send-message', sendMessage);

module.exports = router;