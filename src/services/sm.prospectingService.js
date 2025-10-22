// /services/prospectingService.js
require('dotenv').config();
const axios = require('axios');

const GOOGLE_PLACES_API_URL = process.env.GOOGLE_MAPS_API_URL || "https://maps.googleapis.com/maps/api/place/textsearch/json"; // Valor por defecto para prueba
const GOOGLE_DETAILS_API_URL = "https://maps.googleapis.com/maps/api/place/details/json";
// Asegúrate de tener tu API KEY en un archivo .env o reemplázala aquí para la prueba
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// --- FUNCIÓN DE AYUDA ---

/**
 * Nombres de calles comunes en ciudades de Paraguay para generar datos realistas.
 */
const streetNames = [
    // Asunción (Capital)
    "Mariscal López", "España", "General Santos", "Aviadores del Chaco", "Santa Teresa",
    "Boggiani", "Eusebio Ayala", "Fernando de la Mora", "25 de Mayo", "Cerro Corá",
    "Eligio Ayala", "Brasil", "Perú", "Artigas", "Defensores del Chaco", "Palma",
    "Colón", "Presidente Franco", "Iturbe", "México", "Paraguari", "Antequera",
    "Tacuarí", "Estados Unidos", "Avenida República Argentina", "Avenida Madame Lynch",
    "Avenida Kubitschek", "Avenida Sacramento", "Doctor Bestard", "Choferes del Chaco",
    "Avenida General José Gervasio Artigas", "Avenida Doctor Eusebio Ayala", "Avenida Félix Bogado",

    // Ciudad del Este (Alto Paraná)
    "San Blas", "Monseñor Rodriguez", "Adrián Jara", "Pioneros del Este", "Avenida del Lago",
    "Bernardino Caballero", "Regimiento Piribebuy", "Boquerón", "Nanawa", "Tupí Guaraní",
    "Avenida Alejo García", "Avenida Itaipu Oeste", "Avenida Itaipu Este", "Capitán Miranda",
    "Paí Pérez", "Curupayty", "Avenida Rogelio Benítez", "Avenida Julio César Riquelme",
    "Avenida Fortín Toledo", "Calle Tuyuti", "Avenida Amambay", "Avenida Guarania",

    // Caaguazú (Caaguazú)
    "Independencia Nacional", "Presidente Franco", "Doctor Bottrell", "General Díaz",
    "Bernardino Caballero", "Mariscal Estigarribia", "15 de Agosto", "Caaguazú", "Guairá",
    "Coronel Oviedo", "San Lorenzo", "Avenida Berlamino Garcia", "Calle Panchito López",
    "Calle Fulgencio Yegros", "Calle General Bruguez", "Calle Carlos Antonio López",

    // Encarnación (Itapúa)
    "Mariscal Estigarribia", "Avenida Irrazábal", "Doctor Juan León Mallorquín", "Carlos Antonio López",
    "General Cabañas", "Padre Kreusser", "Monseñor Wiessen", "Avenida Costanera República del Paraguay",
    "Padre Juan Von Winckel", "Avenida Caballero", "Calle Memmel", "Avenida Japón",
    "Avenida Ucrania", "Avenida Alemania", "Calle Cerro Corá", "Calle Antequera",

    // Luque (Central)
    "General Aquino", "Capitán Bado", "Avenida Corrales", "Avenida Humaitá", "Avenida General Elizardo Aquino",
    "Avenida Las Residentas", "Balderrama", "Rosario", "Sportivo Luqueño", "Moisés Bertoni",
    "Javier Bogarín", "Curupayty", "Avenida Nanawa", "Calle Sauce", "Calle Iturbe",

    // San Lorenzo (Central)
    "Mariscal Estigarribia", "Avenida del Agrónomo", "Avenida Avelino Martínez", "Doctor Gabriel Pellón",
    "Doctor Francia", "Coronel Romero", "10 de Agosto", "Julia Miranda Cueto", "Saturio Ríos",
    "España", "Calle Manuel Ortiz Guerrero", "Avenida Laguna Grande", "Calle Hernandarias",
    "Calle Sargento Silva", "Avenida Pastora Céspedes", "Calle 14 de Mayo"
];

/**
 * Selecciona un elemento aleatorio de un array.
 * @param {Array<string>} arr - El array del cual seleccionar.
 * @returns {string} - Un elemento aleatorio.
 */
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];


/**
 * Extrae las primeras dos palabras de un string.
 * @param {string} text - El texto original.
 * @returns {string} - Las primeras dos palabras o el texto original si tiene menos.
 */
const getFirstTwoWords = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/); // Divide por espacios
    return words.slice(0, 2).join(" "); // Toma las primeras 2 y las une con un espacio
};


/**
 * Analiza, formatea y, si es necesario, inventa una dirección con formato de cruce de calles.
 * @param {string|null} address - La dirección original de Google.
 * @returns {string} - La dirección formateada.
 */
/**
 * Analiza, formatea y, si es necesario, inventa una dirección para que SIEMPRE
 * tenga el formato "Calle 1 c/ Calle 2", usando solo las primeras dos palabras de cada calle.
 * @param {string|null} address - La dirección original de Google.
 * @returns {string} - La dirección formateada como cruce (ej: "Nuestra Señora c/ San Lorenzo").
 */
function formatAndValidateAddress(address) {
    console.log(`[AddressFormatter] 🧐 Analizando dirección original: "${address}"`);

    // --- Caso 1: Dirección inválida o nula ---
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
        console.log(`[AddressFormatter] ⚠️ Dirección nula/inválida. Generando una aleatoria.`);
        let street1Raw = getRandomElement(streetNames);
        let street2Raw = getRandomElement(streetNames);
        while (street1Raw === street2Raw) {
            street2Raw = getRandomElement(streetNames);
        }
        // Aplicar getFirstTwoWords
        const street1 = getFirstTwoWords(street1Raw);
        const street2 = getFirstTwoWords(street2Raw);
        return `${street1} c/ ${street2}`;
    }

    // --- Limpieza Inicial ---
    let cleanedAddress = address.replace(/, Paraguay/gi, '')
                                .replace(/\b\d{1,5}\b/g, '') // Elimina números de casa
                                // ... (otras limpiezas como piso, local, etc.)
                                .replace(/[, ]+$/, '').replace(/^[, ]+/, '').trim();

    const addressParts = cleanedAddress.split(',').map(part => part.trim());
    let mainAddressPart = addressParts[0];
    console.log(`[AddressFormatter] ✨ Dirección pre-limpiada: "${mainAddressPart}"`);

    // --- Caso 2: Ya tiene formato de cruce ---
    const intersectionRegex = /(.+?)\s*(?:\bc\/|\by\b|\be\b|\besquina\b)\s*(.+)/i;
    const match = mainAddressPart.match(intersectionRegex);

    if (match && match[1] && match[2]) {
        let street1Raw = match[1].trim();
        let street2Raw = match[2].trim().split(',')[0].trim(); // Limpia ciudad pegada
        console.log(`[AddressFormatter] ✅ Cruce detectado: "${street1Raw} c/ ${street2Raw}"`);
        // Aplicar getFirstTwoWords
        const street1 = getFirstTwoWords(street1Raw);
        const street2 = getFirstTwoWords(street2Raw);
        return `${street1} c/ ${street2}`;
    }

    // --- Caso 3: Dirección muy genérica ---
    const genericAddressRegex = /^(Asunción|Ciudad del Este|Caaguazú|Encarnación|Luque|San Lorenzo)$/i;
    if (genericAddressRegex.test(mainAddressPart) || addressParts.length < 1 || mainAddressPart.length < 5) {
        console.log(`[AddressFormatter] 💡 Dirección muy genérica ("${mainAddressPart}"). Inventando un cruce.`);
        let street1Raw = getRandomElement(streetNames);
        let street2Raw = getRandomElement(streetNames);
        while (street1Raw === street2Raw) {
            street2Raw = getRandomElement(streetNames);
        }
        // Aplicar getFirstTwoWords
        const street1 = getFirstTwoWords(street1Raw);
        const street2 = getFirstTwoWords(street2Raw);
        return `${street1} c/ ${street2}`;
    }

    // --- Caso 4: Dirección parece tener una sola calle ---
    console.log(`[AddressFormatter] 💡 Una sola calle detectada ("${mainAddressPart}"). Inventando la segunda.`);
    let street1Raw = mainAddressPart;
    let street2Raw = getRandomElement(streetNames);
    while (street2Raw.toLowerCase() === street1Raw.toLowerCase() || streetNames.filter(s => s.toLowerCase() === street1Raw.toLowerCase()).length > 1 && street2Raw.toLowerCase().includes(street1Raw.toLowerCase().substring(0,5)) ) {
         street2Raw = getRandomElement(streetNames);
    }
    // Aplicar getFirstTwoWords
    const street1 = getFirstTwoWords(street1Raw);
    const street2 = getFirstTwoWords(street2Raw);
    return `${street1} c/ ${street2}`;
}

// --- SERVICIO PRINCIPAL ---

async function getPlaceDetails(placeId) {
    console.log(`[ProspectingService] 📞 Obteniendo detalles para place_id: ${placeId}`);

    const params = {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: "name,formatted_phone_number,international_phone_number,formatted_address,rating",
        language: 'es'
    };

    try {
        const response = await axios.get(GOOGLE_DETAILS_API_URL, { params });
        return response.data.result;
    } catch (error) {
        console.error(`[ProspectingService] 🔴 Error obteniendo detalles para ${placeId}:`, error.message);
        return null;
    }
}

async function findBusiness(businessName) {
    console.log(`[ProspectingService] 🔍 Buscando lugar para: "${businessName}"...`);

    if (!GOOGLE_MAPS_API_KEY) {
        console.error("🔴 ¡ERROR! La variable de entorno GOOGLE_MAPS_API_KEY no está definida.");
        return null;
    }

    const searchParams = {
        query: `${businessName} en Paraguay`,
        key: GOOGLE_MAPS_API_KEY,
        language: 'es',
        region: 'py'
    };

    try {
        const searchResponse = await axios.get(GOOGLE_PLACES_API_URL, { params: searchParams });
        const searchResults = searchResponse.data.results;

        if (!searchResults || searchResults.length === 0) {
            console.log(`[ProspectingService] 🤷 No se encontraron resultados en la búsqueda.`);
            return null;
        }

        const selectedPlace = searchResults[0];

        if (!selectedPlace.place_id) {
            console.log(`[ProspectingService] ⚠️ El resultado principal no tiene place_id.`);
            const basicInfo = {
                nombre: selectedPlace.name || "Sin nombre",
                telefono: null,
                direccion: formatAndValidateAddress(selectedPlace.formatted_address),
                rating: selectedPlace.rating || null
            };
            // --- IMPRESIÓN DEL RESULTADO FINAL ---
            console.log("------------------- RESULTADO FINAL -------------------");
            console.log(JSON.stringify(basicInfo, null, 2));
            console.log("-----------------------------------------------------");
            return basicInfo;
        }

        const placeDetails = await getPlaceDetails(selectedPlace.place_id);

        if (!placeDetails) {
            console.log(`[ProspectingService] ⚠️ No se pudieron obtener los detalles.`);
            return null;
        }

        const business = {
            nombre: placeDetails.name || "Sin nombre",
            telefono: placeDetails.formatted_phone_number || placeDetails.international_phone_number || null,
            direccion: formatAndValidateAddress(placeDetails.formatted_address),
            rating: placeDetails.rating || null
        };

        console.log(`[ProspectingService] ✅ Datos completos obtenidos para: "${business.nombre}"`);
        
        // --- IMPRESIÓN DEL RESULTADO FINAL ---
        console.log("\n------------------- RESULTADO FINAL -------------------");
        console.log(JSON.stringify(business, null, 2));
        console.log("-----------------------------------------------------\n");
        
        return business;

    } catch (error) {
        console.error("[ProspectingService] 🔴 Error en el flujo de búsqueda:", error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = {
    findBusiness,
};


// --- BLOQUE DE PRUEBA PARA EJECUTAR DIRECTAMENTE ---
// Para usarlo, ejecuta en tu terminal: node services/prospectingService.js
// Necesitas tener un archivo .env con tu GOOGLE_MAPS_API_KEY
const main = async () => {
    // ---- Elige el negocio que quieres probar ----
    const businessToFind = "Shopping París"; 
    // const businessToFind = "Biggie Express Asunción";
    // const businessToFind = "Pizzeria Lo de Osvaldo";
    
    console.log(`=====================================================`);
    console.log(`            INICIANDO PRUEBA DE BÚSQUEDA`);
    console.log(`=====================================================`);
    await findBusiness(businessToFind);
};

// Esta línea verifica si el archivo se está ejecutando directamente
if (require.main === module) {
    main();
}