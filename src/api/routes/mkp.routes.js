// /routes/accumulator.routes.js

const express = require('express');
const router = express.Router();
const accumulatorController = require('../controllers/evo.acumulador.controller'); // Adjust path if needed

// POST route for receiving webhooks (existing)
router.post('/', accumulatorController.handleWebhook);

// --- NEW GET ROUTE ---
// Responds with "OK" for health checks or simple verification
router.get('/', (req, res) => {
    res.status(200).send('mkp OK');
});
// --------------------

module.exports = router;