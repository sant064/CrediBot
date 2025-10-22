// controllers/prospecting.controller.js

// Importamos el servicio que tiene la lógica de búsqueda
const prospectingService = require('../services/prospectingService');

const searchBusiness = async (req, res) => {
    // 1. Extraemos el dato del cuerpo (body) de la petición
    const { telefono ,message } = req.body;

    // 2. Validamos que el dato exista
    if (!message) {
        return res.status(400).json({ error: 'El campo message es requerido en el body' });
    }

    try {
        // 3. Llamamos al servicio para que haga la búsqueda
        const result = await prospectingService.findBusiness(message);

        // 4. Respondemos al cliente según el resultado
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: 'Negocio no encontrado' });
        }
    } catch (error) {
        console.error("🔴 Error en el controlador:", error);
        res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
    }
};

// Exportamos la función para que la ruta pueda usarla
module.exports = {
    searchBusiness
};