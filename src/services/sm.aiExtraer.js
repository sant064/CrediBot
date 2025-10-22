require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = process.env.GEMINI_MODEL || "gemini-pro";
console.log(`[AIService] 🤖 Usando el modelo de IA: "${modelName}"`);
const model = genAI.getGenerativeModel({ model: modelName });

// ========================================================================
// ¡NUEVO! Constantes de Reintentos
// ========================================================================
const MAX_AI_RETRIES = 3;
const AI_RETRY_DELAY_MS = 5000; // 5 segundos

// ========================================================================
// LISTA DE CALLES Y FUNCIÓN DE AYUDA
// ========================================================================
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

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];


// ========================================================================
// PROMPT DE SISTEMA AVANZADO
// ========================================================================
const SYSTEM_PROMPT_EXTRACTOR = `
Eres un asistente de IA experto en procesar datos de referencias y direcciones para un sistema en Paraguay. Tu función es EXTRACCIÓN y COMPLETADO.

**REGLAS ESTRICTAS:**
1.  **DETECTA DATOS:** Analiza el texto en busca de los campos solicitados.
2.  **FORMATO JSON ESTRICTO:** Tu respuesta DEBE ser únicamente un objeto JSON válido.
3.  **CLAVES EXACTAS:** Utiliza SOLAMENTE las claves proporcionadas (ej: "ciudad", "barrio", "referencia_1").
4.  **REFERENCIAS:** Para cada referencia, combina nombre y teléfono en un solo texto ("Nombre Apellido Telefono"). Limpia el teléfono de espacios o guiones.
5.  **DIRECCIÓN:** Extrae ciudad y barrio si están presentes. No inventes calles.

**LÓGICA DE COMPLETADO (SOLO PARA REFERENCIAS):**
* **SI SOLO HAY TELÉFONO:** Inventa nombre y apellido común de Paraguay.
* **SI SOLO HAY UN NOMBRE/APODO:** Inventa apellido común de Paraguay.
* **SI EL NOMBRE ES UN APODO FAMILIAR (mamá, papá, tío, etc.):** IGNORA el apodo e INVENTA nombre y apellido nuevos.
* **SI SOLO HAY NOMBRE (SIN TELÉFONO):** Ignora la referencia.

**EJEMPLOS DE RESPUESTA JSON:**
{ "ciudad": "Asunción", "barrio": "Sajonia" }
{ "referencia_1": "Sofi Benitez 0981123456", "referencia_2": "Carlos Vera 0971987654" }
{ "ciudad": "Luque", "referencia_1": "Graciela Gonzalez 0981123456" }
`;

// Función de ayuda para la espera (delay)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ========================================================================
// EXTRACTOR Y MERGER DE DATOS (Función Unificada)
// ========================================================================
/**
 * Extrae datos de un mensaje y los fusiona con el estado actual de la BBDD.
 * @param {string} message - El mensaje del usuario.
 * @param {object} currentState - El objeto con los datos actuales de la BBDD (la 'solicitud').
 * @returns {object} - Un objeto listo para actualizar la BBDD.
 */
async function extractDataFromMessage(message, currentState) {
    console.log("[AIService] 📥 Extrayendo y fusionando datos del mensaje:", message);
    console.log("[AIService] 📥 Estado actual BBDD:", currentState);

    if (!currentState) {
        console.error("[AIService] 🔴 ¡ERROR! currentState (solicitud) es undefined.");
        return {};
    }

    // 1. Determinar qué campos faltan en el estado actual
    const missingFields = [];
    if (!currentState.ciudad) missingFields.push("ciudad: la ciudad donde vive el usuario");
    if (!currentState.barrio) missingFields.push("barrio: el barrio donde vive el usuario");
    if (!currentState.referencia_1) missingFields.push("referencia_1: la primera referencia (nombre y teléfono)");
    if (!currentState.referencia_2) missingFields.push("referencia_2: la segunda referencia (nombre y teléfono)");
    if (!currentState.referencia_3) missingFields.push("referencia_3: la tercera referencia (nombre y teléfono)");

    if (missingFields.length === 0) {
        console.log("[AIService] ✅ No faltan campos clave. No se necesita extracción.");
        return {};
    }

    const finalPrompt = `${SYSTEM_PROMPT_EXTRACTOR}
**TAREA ACTUAL:**
-   Campos a extraer (solo los que faltan):
${missingFields.join('\n')}
-   Texto del usuario: "${message}"
-   TU RESPUESTA JSON:
`;
    
    let extractedData = {}; // Datos extraídos por la IA
    const outputData = {}; // Objeto final a devolver
    let aiSuccess = false; // Flag para saber si la IA funcionó

    try {
        // ====================================================================
        // --- ¡NUEVO! 2. Llamar a la IA con lógica de reintentos ---
        // ====================================================================
        for (let attempt = 1; attempt <= MAX_AI_RETRIES; attempt++) {
            try {
                console.log(`[AIService - Extractor] 🤖 Intento de IA ${attempt}/${MAX_AI_RETRIES}...`);
                
                const result = await model.generateContent(finalPrompt);
                let text = result.response.text().replace(/```json|```/g, '').trim();
                if (text.startsWith('{') === false) text = '{' + text.split('{').pop();
                
                extractedData = JSON.parse(text); // Parsea la respuesta de Gemini
                
                console.log("[AIService - Extractor] ✨ Datos extraídos por IA:", extractedData);
                aiSuccess = true; // Marcamos éxito
                break; // Salimos del bucle de reintentos
                
            } catch (aiError) {
                console.error(`[AIService - Extractor] 🔴 Error IA en intento ${attempt}/${MAX_AI_RETRIES}:`, aiError.message);
                if (attempt < MAX_AI_RETRIES) {
                    console.log(`[AIService - Extractor] ⏳ Reintentando en ${AI_RETRY_DELAY_MS / 1000} segundos...`);
                    await sleep(AI_RETRY_DELAY_MS);
                }
            }
        }

        // Si después de todos los intentos, no hubo éxito, lanzamos un error
        if (!aiSuccess) {
            throw new Error("Fallaron todos los intentos de comunicación con la IA.");
        }
        
        // --- FIN DE LA LÓGICA DE REINTENTOS ---


        // 3. Generar dirección inventada (si aplica)
        if (extractedData.ciudad && extractedData.ciudad.trim().length > 0) {
            console.log("[AIService - Extractor] 🏠 Ciudad encontrada. Generando dirección inventada...");
            let street1 = getRandomElement(streetNames);
            let street2 = getRandomElement(streetNames);
            while (street1 === street2) { // Asegura calles diferentes
                street2 = getRandomElement(streetNames);
            }
            // Añade la dirección inventada a los datos extraídos para que el merger la procese
            extractedData.direccion_inventada = `${street1} c/ ${street2}`; 
            console.log(`[AIService - Extractor] ✅ Dirección inventada generada: "${extractedData.direccion_inventada}"`);
        } else {
             console.log("[AIService - Extractor] ℹ️ No se extrajo ciudad, no se genera dirección inventada.");
        }

        // ====================================================================
        // --- INICIO DE LÓGICA DE MERGE (Portado de n8n) ---
        // ====================================================================
        console.log("[AIService - Merger] 🔄 Iniciando merge con estado actual...");

        // 4. Copiar campos NO referencia de la IA al output
        // (Esto incluye 'ciudad', 'barrio' y 'direccion_inventada' si existen)
        for (const key in extractedData) {
            const value = extractedData[key];
            const hasValue = value !== null && value !== undefined && value !== '';
            
            // Copia cualquier clave que NO comience con 'referencia_' y tenga valor
            if (hasValue && !key.startsWith('referencia_')) {
                console.log(`[AIService - Merger] Copiando campo no-referencia: ${key}`);
                outputData[key] = value;
            }
        }
        console.log("[AIService - Merger] 📋 Output inicial (campos no-referencia):", outputData);


        // 5. Recolectar referencias extraídas por IA
        const extractedReferences = [];
        // Añadir solo si existen y no están vacías en la respuesta de la IA
        if (extractedData.referencia_1 && extractedData.referencia_1 !== '') extractedReferences.push(extractedData.referencia_1);
        if (extractedData.referencia_2 && extractedData.referencia_2 !== '') extractedReferences.push(extractedData.referencia_2);
        if (extractedData.referencia_3 && extractedData.referencia_3 !== '') extractedReferences.push(extractedData.referencia_3);
        
        if(extractedReferences.length > 0) {
             console.log("[AIService - Merger] 📞 Referencias extraídas válidas:", extractedReferences);
        } else {
             console.log("[AIService - Merger] 📞 No se extrajeron referencias válidas.");
        }

        // 6. Lógica de llenado secuencial de referencias
        const referenceSlots = ['referencia_1', 'referencia_2', 'referencia_3'];
        let refsAvailable = [...extractedReferences]; // Copia para poder modificarla

        for (const slot of referenceSlots) {
            // Verificar si el slot actual en BBDD (currentState) está vacío
            const isSlotEmpty = currentState[slot] === null || currentState[slot] === undefined || currentState[slot] === '';
            
            console.log(`[AIService - Merger] Comprobando slot ${slot}: ¿Vacío en BBDD? ${isSlotEmpty}. ¿Refs IA disponibles? ${refsAvailable.length > 0}`);

            if (isSlotEmpty && refsAvailable.length > 0) {
                // Si el slot está vacío Y hay referencias disponibles de la IA...
                const refValueToAdd = refsAvailable.shift(); // Tomar la PRIMERA referencia disponible
                outputData[slot] = refValueToAdd; // Asignar el valor al slot en la salida
                console.log(`[AIService - Merger] -> Asignando al slot ${slot}:`, refValueToAdd);
            } else if (!isSlotEmpty) {
                console.log(`[AIService - Merger] -> Slot ${slot} ya ocupado en BBDD: "${currentState[slot]}"`);
            } else {
                 console.log(`[AIService - Merger] -> Slot ${slot} vacío, pero no hay más refs de IA.`);
            }
        }
        // ====================================================================
        // --- FIN DE LÓGICA DE MERGE ---
        // ====================================================================

        console.log("[AIService] ✅ Proceso completado. Datos finales a enviar:", outputData);
        return outputData; // Devuelve el objeto MERGEADO final

    } catch (error) {
        // Este catch ahora atrapa errores en la lógica de MERGE 
        // o el error que lanzamos si TODOS los intentos de IA fallaron.
        console.error("[AIService] 🔴 Error general del proceso:", error.message);
        return {}; // Devuelve objeto vacío en caso de error
    }
}

module.exports = {
    extractDataFromMessage,
};