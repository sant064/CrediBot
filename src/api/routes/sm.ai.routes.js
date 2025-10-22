// /routes/ai.routes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Leemos la ruta desde el archivo .env o usamos /extract por defecto
const extractRoute = process.env.EXTRACT_API_ROUTE || '/';

// Cuando se recibe una petición POST en esta ruta, se ejecuta la función del controlador.
router.post(extractRoute, aiController.handleExtractData);

module.exports = router;