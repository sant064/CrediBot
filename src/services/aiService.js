// /services/aiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ========================================================================
// MÓDULO 1: CLASIFICADOR DE INTENCIONES (El Bibliotecario Rígido)
// ========================================================================

const VALID_CATEGORIES = ['prestamo', 'internet', 'regalos', 'saludo'];

// --- PROMPT MEJORADO ---
const SYSTEM_INSTRUCTION_CLASSIFIER = `
Eres un clasificador de texto de UNA SOLA PALABRA. Tu única función es la coincidencia de palabras clave.
REGLAS:
1. Tu prioridad es encontrar palabras clave de negocio. Si encuentras una palabra de 'prestamo', 'internet' o 'regalos', IGNORA cualquier saludo en la misma frase.
2. Si el mensaje NO contiene NINGUNA palabra clave de negocio o saludo, responde ÚNICAMENTE 'desconocido'.
3. Responde SÓLO con el nombre de la CATEGORÍA en MINÚSCULAS.

CATEGORÍAS Y PALABRAS CLAVE:
- prestamo: cuotas, banco, préstamo, crédito, cuotero
- internet: internet, instalación, cobertura, plan
- regalos: zapatos, cartera
- saludo: hola, saludos, qué tal, buen día
`;

// ... (El resto de las funciones del clasificador siguen igual)
function validateAndForceIntent(intent) {
    const cleanedIntent = intent.trim().toLowerCase();
    if (VALID_CATEGORIES.includes(cleanedIntent) || cleanedIntent === 'desconocido') {
        return cleanedIntent;
    }
    console.warn(`[AIService - Classifier] 🛑 Forzando '${cleanedIntent}' a 'desconocido'.`);
    return 'desconocido';
}

async function recognizeIntent(userMessage) {
    try {
        const chat = model.startChat({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION_CLASSIFIER }], role: "model" }
        });
        const result = await chat.sendMessage(userMessage);
        const rawIntent = result.response.text();
        return validateAndForceIntent(rawIntent);
    } catch (error) {
        console.error("[AIService - Classifier] 🔴 Error:", error);
        return 'desconocido';
    }
}


// ========================================================================
// MÓDULO 2: EXTRACTOR DE DATOS (El Detective Inteligente)
// ========================================================================

/**
 * EXTRACTOR: Analiza si un texto es una afirmación o negación.
 */
async function analyzeYesNo(message) { 
    const prompt = `Analiza el siguiente mensaje: "${message}". ¿El usuario está diciendo 'SÍ', 'ACEPTO', 'CONFIRMO' o algo similar (true) o está diciendo 'NO', 'NUNCA', 'NEGATIVO' o algo similar (false)? Devuelve SOLAMENTE un objeto JSON con la clave "respuesta_booleana" y el valor booleano (true o false). Si no puedes determinar, devuelve {"respuesta_booleana": null}.`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json|```/g, '').trim();

        // Intenta corregir el texto si no empieza con '{' (problema común con la salida de IA)
        if (text.startsWith('{') === false) {
             text = '{' + text.split('{').pop();
        }

        const jsonResponse = JSON.parse(text);
        
        // Devolvemos el valor directamente (true, false, o null)
        return jsonResponse.respuesta_booleana; 
    } catch (error) {
        console.error("[AIService] 🔴 Error en analyzeYesNo:", error);
        // En caso de error, devolvemos null para que el llamador repita la pregunta.
        return null; 
    }
}

/**
 * EXTRACTOR: Extrae datos estructurados de un texto libre.
 */
async function extractDataFromMessage(message, currentState) {
   console.log("[AIService - Extractor] 📥 Extrayendo datos del mensaje:");
    console.log(message)
    console.log(currentState);
    const missingFields = [];
    if (!currentState.empresa) missingFields.push("empresa: el nombre de la empresa donde trabaja");
    if (!currentState.ciudad) missingFields.push("ciudad: la ciudad de residencia");
    
    if (missingFields.length === 0) return {};

    // --- PROMPT MEJORADO ---
    const prompt = `
        Analiza el siguiente texto y extrae la información solicitada.
        Devuelve el resultado SOLAMENTE en formato JSON, usando estrictamente las claves de una sola palabra que te proporciono (ej: "empresa", "ciudad").
        Si no encuentras nada, devuelve un JSON vacío {}.
        
        Campos a extraer:
        ${missingFields.join('\n')}
        
        Texto del usuario: "${message}"
    `;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json|```/g, '').trim();
        // A veces Gemini responde con texto antes del JSON, intentamos limpiarlo.
        if (text.startsWith('{') === false) {
            text = '{' + text.split('{').pop();
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("[AIService - Extractor] 🔴 Error en extractDataFromMessage:", error);
        return {};
    }
}


// ========================================================================
// EXPORTACIONES
// ========================================================================
module.exports = {
    recognizeIntent,
    analyzeYesNo,
    extractDataFromMessage
};