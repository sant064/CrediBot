// /routes/config.routes.js

const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Le decimos al router que cualquier petición GET a "/:key" debe ser manejada
// por la función getConfigByKey del controlador.
router.get('/:key', configController.getConfigByKey);

module.exports = router;