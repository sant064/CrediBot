// /routes/loan.routes.js

const express = require('express');
const router = express.Router();

// Importamos ambos controladores
const loanController = require('../controllers/loanController');
const loanAdminController = require('../controllers/loanAdminController');

// --- Rutas Conversacionales (Máquina de Estados) ---
router.post('/advance', loanController.processDataCollectionStep);

// --- Rutas de Administración (CRUD) ---
// --- Rutas de Administración ---
router.post('/prestamos', loanAdminController.createOrUpdateLoanApplication); // Upsert
// --- NUEVA RUTA GET para verificar Cédula ---
router.get('/prestamos/telefono/:telefono', loanAdminController.checkTelefonoExists); // <-- AÑADIR ESTA LÍNEA

module.exports = router;