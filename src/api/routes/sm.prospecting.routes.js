// routes/prospecting.routes.js

const express = require('express');
const router = express.Router();

// Importamos la función que se encargará de la lógica
const { searchBusiness } = require('../controllers/prospecting.controller');

// Definimos la ruta:
// Cuando llegue una petición POST a /search, llama a la función searchBusiness
router.post('/', searchBusiness);

module.exports = router;