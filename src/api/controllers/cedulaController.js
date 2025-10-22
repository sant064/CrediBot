// /controllers/cedulaController.js

const cedulaService = require('../../services/cedulaService');

function extractCedulaFromString(texto) {
    if (!texto) return "0";

    const partes = texto.split(/[-\s]+/);
    for (const parte of partes) {
        const resultado = parte.replace(/[^0-9]/g, '');
        const numero = parseInt(resultado, 10);

        if (!numero) continue;
        if ([1000000,1500000,2000000,2500000,2800000,3000000,3500000,4000000,4500000,5000000,5500000,6000000,6500000,7000000,7500000,8000000,8500000,9000000].includes(numero)) continue;

        if (numero < 9000000 && numero > 999000) {
            return String(numero); // Devuelve la cédula encontrada
        }
    }
    return "0"; // No se encontró cédula
}

const extractCedula = async (req, res) => {
    console.log('=============================================')
    const { texto } = req.body;
    if (!texto) {
       // console.log('[CedulaController] ⚠️ Falta el parámetro "texto" en la petición.');
        return res.status(400).json({ error: "Falta el parámetro 'texto'" });
    }

    const cedula = extractCedulaFromString(texto);

    if (cedula !== "0") {
      //  console.log(`[CedulaController] ✅ Cédula extraída: ${cedula}`);
        res.json({ validacion: true, cedula: cedula });
    } else {
      //  console.log('[CedulaController] ⚠️ No se pudo extraer una cédula válida.');
        res.json({ validacion: false });
    }
};
/**
 * --- NUEVA FUNCIÓN ---
 * Maneja la petición para hacer scraping de una cédula.
 */
const scrapeCedulaData = async (req, res) => {
    console.log('=============================================');
    console.log('[CedulaController] ⚡ Petición RECIBIDA para hacer scraping');

    try {
        const { cedula } = req.params; // Tomamos la cédula de la URL
        if (!cedula) {
            return res.status(400).json({ error: 'Número de cédula es requerido en la URL.' });
        }

        // 2. Llamamos al servicio para que haga el trabajo pesado
        const datos = await cedulaService.scrapeData(cedula);
        
        console.log(`[CedulaController] ✅ Scraping completado. Enviando respuesta.`);
        res.json(datos);

    } catch (error) {
        console.error('[CedulaController] 🔴 Error en el proceso de scraping:', error);
        res.status(500).json({ error: 'Error interno del servidor durante el scraping.' });
    }
};


// 3. Actualizamos los exports
module.exports = { 
    extractCedula,
    scrapeCedulaData 
};