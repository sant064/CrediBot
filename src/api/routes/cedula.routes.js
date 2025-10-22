// /routes/cedula.routes.js

const express = require('express');
const router = express.Router();

// 1. Importamos ambas funciones del controlador
const { extractCedula, scrapeCedulaData } = require('../controllers/cedulaController');

// Ruta existente para extracción rápida
router.post('/extract', extractCedula);

// --- NUEVA RUTA ---
// Ruta para el scraping lento. Usamos GET porque es una consulta por ID.
router.get('/scrape/:cedula', scrapeCedulaData);

module.exports = router;