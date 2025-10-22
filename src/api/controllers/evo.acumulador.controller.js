// /controllers/accumulatorController.js

const axios = require('axios');

// --- Configuration ---
const ACCUMULATION_TIMEOUT_MS = parseInt(process.env.ACCUMULATION_TIMEOUT_SECONDS || '20', 10) * 1000;
const TARGET_URL = process.env.TARGET_N8N_URL || 'TU_WEBHOOK_URL_DE_N8N_AQUI'; // Replace or use .env
const PORT = process.env.PORT || 3001; // Port where THIS Node.js app runs
const HOST_IP = process.env.HOST_IP || 'localhost'; // IP/Hostname of THIS Node.js app

// --- Temporary In-Memory Storage ---
// Map<sender, { messages: string[], timerId: NodeJS.Timeout | null, firstWebhookBody: object }>
const messageBuffer = new Map();

console.log(`[Accumulator] ⏳ Accumulation time: ${ACCUMULATION_TIMEOUT_MS / 1000}s`);
console.log(`[Accumulator] 🎯 Target URL: ${TARGET_URL}`);

// --- Helper Function to Process and Send ---
async function processAndSendAccumulatedMessages(sender) {
    const data = messageBuffer.get(sender);
    if (!data) return; // Already processed

    console.log(`[Accumulator] ⏰ Timeout for ${sender}. Processing ${data.messages.length} messages.`);
    clearTimeout(data.timerId); // Clear timer just in case

    const concatenatedMessage = data.messages.join(' - ');
    const firstWebhook = data.firstWebhookBody;

    // --- Data Extraction (Adapt based on your needs and firstWebhook structure) ---
    const cleanData = {
        instanceId: firstWebhook?.instance,
        sender: sender?.split('@')[0],
        userMessage: concatenatedMessage,
        url_server: firstWebhook?.server_url,
        apikey: firstWebhook?.apikey,
        messageType: firstWebhook?.data?.messageType || firstWebhook?.data?.message?.messageType, // Try both common places
        fromMe: firstWebhook?.data?.key?.fromMe === true,
        nodeServer: `http://${HOST_IP}:${PORT}`, // Where this accumulator runs
        fuente: firstWebhook?.sender?.split('@')[0],
        clase: sender?.split('@')[1],
        status: firstWebhook?.data?.pushName,
        // Add other fields you need based on the 'image_1a6972.png' structure
    };
    // --------------------------------------------------------------------------

    console.log(`[Accumulator] 📦 Sending data for ${sender}:`, JSON.stringify(cleanData, null, 2));

    try {
        await axios.post(TARGET_URL, cleanData, { headers: { 'Content-Type': 'application/json' } });
        console.log(`[Accumulator] ✅ POST sent successfully for ${sender}.`);
    } catch (error) {
        console.error(`[Accumulator] 🔴 Error sending POST for ${sender}:`, error.response?.data || error.message);
    } finally {
        messageBuffer.delete(sender); // Clean up buffer
        console.log(`[Accumulator] 🧹 Buffer cleaned for ${sender}.`);
    }
}

// --- Main Controller Function for the Webhook ---
const handleWebhook = (req, res) => {
    const webhookBody = req.body;
    // console.log('[Accumulator] 📩 Webhook received:', JSON.stringify(webhookBody, null, 2)); // Uncomment for deep debug

    // --- Extract Key Data (Adapt paths based on actual Evolution API webhook structure) ---
    const sender = webhookBody?.data?.key?.remoteJid || webhookBody?.sender; // Check both potential locations
    const messageText = webhookBody?.data?.message?.conversation
                     || webhookBody?.data?.message?.extendedTextMessage?.text
                     || webhookBody?.message?.body; // Check common text locations
    const fromMe = webhookBody?.data?.key?.fromMe;
    const isGroup = sender?.includes('@g.us');
    // ----------------------------------------------------------------------------------

    if (!sender || !messageText) {
        console.warn('[Accumulator] ⚠️ Webhook ignored: Missing sender or message text.');
        return res.status(200).send('OK (Ignored - Missing Data)');
    }

    if (fromMe || isGroup) {
        console.log(`[Accumulator] ➡️ Ignored: Message from self or group (${sender}).`);
        return res.status(200).send('OK (Ignored - From Me or Group)');
    }

    console.log(`[Accumulator] ▶️ Received from ${sender}: "${messageText}"`);

    const existingEntry = messageBuffer.get(sender);

    if (existingEntry) {
        console.log(`[Accumulator] ➕ Adding to buffer for ${sender}.`);
        existingEntry.messages.push(messageText);
        clearTimeout(existingEntry.timerId); // Reset timer
        existingEntry.timerId = setTimeout(() => processAndSendAccumulatedMessages(sender), ACCUMULATION_TIMEOUT_MS);
    } else {
        console.log(`[Accumulator] ⭐ Creating new buffer for ${sender}.`);
        messageBuffer.set(sender, {
            messages: [messageText],
            timerId: setTimeout(() => processAndSendAccumulatedMessages(sender), ACCUMULATION_TIMEOUT_MS),
            firstWebhookBody: webhookBody // Store the first webhook body to extract metadata later
        });
    }

    // Respond immediately to the webhook source
    res.status(200).send('OK (Received)');
};

module.exports = {
    handleWebhook
};