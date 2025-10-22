// /services/aiService.test.js

// 1. Cargar las variables de entorno (¡muy importante!)
require('dotenv').config({ path: '../.env' }); 

// 2. Importar el servicio de IA que vamos a probar
const aiService = require('./aiService');

// 3. Definir una función principal asíncrona para ejecutar las pruebas
async function runTests() {
    console.log("=============================================");
    console.log("🚀 INICIANDO PRUEBAS DEL SERVICIO DE IA 🚀");
    console.log("=============================================\n");

    // --- Prueba 1: Módulo Clasificador (recognizeIntent) ---
    console.log("--- Módulo 1: Probando el Clasificador de Intenciones ---\n");
    
    const testMessage1 = "Hola, necesito información sobre un préstamo";
    console.log(`[TEST] Mensaje de entrada: "${testMessage1}"`);
    const intent1 = await aiService.recognizeIntent(testMessage1);
    console.log(`[RESULTADO] Intención reconocida: "${intent1}" (Esperado: "prestamo")\n`);

    const testMessage2 = "qué tal buen día";
    console.log(`[TEST] Mensaje de entrada: "${testMessage2}"`);
    const intent2 = await aiService.recognizeIntent(testMessage2);
    console.log(`[RESULTADO] Intención reconocida: "${intent2}" (Esperado: "saludo")\n`);

    const testMessage3 = "cuánto cuesta el envío a mi ciudad";
    console.log(`[TEST] Mensaje de entrada: "${testMessage3}"`);
    const intent3 = await aiService.recognizeIntent(testMessage3);
    console.log(`[RESULTADO] Intención reconocida: "${intent3}" (Esperado: "desconocido")\n`);

    console.log("---------------------------------------------\n");

    // --- Prueba 2: Módulo Extractor (analyzeYesNo) ---
    console.log("--- Módulo 2: Probando el Extractor Sí/No ---\n");

    const yesMessage = "claro que sí, no tengo deudas";
    console.log(`[TEST] Mensaje de entrada: "${yesMessage}"`);
    const yesResult = await aiService.analyzeYesNo(yesMessage);
    console.log(`[RESULTADO] Análisis: ${yesResult} (Esperado: true)\n`);

    const noMessage = "para nada, ninguna";
    console.log(`[TEST] Mensaje de entrada: "${noMessage}"`);
    const noResult = await aiService.analyzeYesNo(noMessage);
    console.log(`[RESULTADO] Análisis: ${noResult} (Esperado: false)\n`);

    const maybeMessage = "no estoy seguro";
    console.log(`[TEST] Mensaje de entrada: "${maybeMessage}"`);
    const maybeResult = await aiService.analyzeYesNo(maybeMessage);
    console.log(`[RESULTADO] Análisis: ${maybeResult} (Esperado: null)\n`);
    
    console.log("---------------------------------------------\n");

    // --- Prueba 3: Módulo Extractor (extractDataFromMessage) ---
    console.log("--- Módulo 3: Probando el Extractor de Datos ---\n");

    const dataMessage = "Hola, trabajo en Ferretería El Martillo y vivo en Asunción";
    const currentState = { empresa: null, ciudad: null, barrio: 'Sajonia' }; // Simulamos que ya tenemos el barrio
    console.log(`[TEST] Mensaje de entrada: "${dataMessage}"`);
    console.log(`[TEST] Estado actual:`, currentState);
    const extractedData = await aiService.extractDataFromMessage(dataMessage, currentState);
    console.log(`[RESULTADO] Datos extraídos:`, extractedData, `(Esperado: { empresa: "Ferretería El Martillo", ciudad: "Asunción" })\n`);
    
    console.log("=============================================");
    console.log("✅ PRUEBAS FINALIZADAS ✅");
    console.log("=============================================");
}

// 4. Ejecutar la función de pruebas
runTests();