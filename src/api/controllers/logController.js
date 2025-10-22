// /controllers/logController.js

const chatRepository = require('../../repositories/chatRepository');

const logChatMessage = async (req, res) => {
    // --- LOG 1: Entrada Cruda ---
    console.log('=============================================');
    console.log('[LogController] 📨 Petición RECIBIDA para /api/log/chat');
    console.log('[LogController] 📥 Cuerpo (Body) recibido:', JSON.stringify(req.body, null, 2)); // Imprime el JSON formateado

    try {
        const chatData = req.body;

        // --- LOG 2: Validación (Re-habilitada con logs) ---
        // Descomenté tu validación para que podamos ver si falla
        if (!chatData || !chatData.sender || !chatData.message) {
            console.log('[LogController] ⚠️ VALIDACIÓN FALLIDA: Faltan datos (sender o message). Petición será rechazada.');
            // Decidí rechazar aquí en lugar de continuar, para evitar guardar datos incompletos.
            return res.status(400).json({ error: 'Los campos sender y message son requeridos.' });
        } else {
            console.log('[LogController] ✅ Validación PASADA: Campos sender y message presentes.');
        }

        // --- LOG 3: Datos a Guardar ---
        console.log('[LogController] 💾 Intentando guardar en BBDD los siguientes datos:', JSON.stringify(chatData, null, 2));

        // Aquí le pasa el trabajo al repositorio para que lo guarde en la base de datos
        const record = await chatRepository.createChatLog(chatData);

        // --- LOG 4: Resultado del Guardado ---
        if (record && record.id) {
            console.log(`[LogController] ✅ ÉXITO: Registro guardado con ID: ${record.id}`);
        } else {
            console.warn('[LogController] 🤔 ADVERTENCIA: El repositorio no devolvió un registro válido después de guardar.', record);
        }

        // Respondemos con el registro creado (o lo que devuelva el repo)
        res.status(201).json(record || { message: "Procesado pero sin ID de registro devuelto." });

    } catch (error) {
        // --- LOG 5: Error Durante el Proceso ---
        console.error('[LogController] 🔴 ERROR FATAL al procesar la petición de log:', error);
        console.error('[LogController] 🚨 Datos que causaron el error:', JSON.stringify(req.body, null, 2));
        res.status(500).json({ error: 'Error interno del servidor al guardar el chat.' });
    } finally {
        console.log('============================================='); // Cierre visual
    }
};

/**
 * --- NUEVA FUNCIÓN ---
 * Maneja la petición para obtener todos los chats.
 */
const getAllChats = async (req, res) => {
 
  try {
    const allChats = await chatRepository.getAllChats();
    
    // --- INICIA LA MAGIA HTML ---

    // 1. Convertimos cada registro de chat en una fila <tr> para nuestra tabla
    const tableRows = allChats.map(chat => `
        <tr>
            <td>${new Date(chat.created).toLocaleString('es-PY', { timeZone: 'America/Asuncion' })}</td>
            <td>${chat.sender}</td>
            <td>${chat.message}</td>
            <td>${chat.status}</td>
            <td>${chat.tipo}</td>
            <td>${chat.fuente || ''}
            <td>${chat.clase || ''}</td></td>
        </tr>
    `).join(''); // El .join('') une todas las filas en un solo bloque de texto

    // 2. Creamos la página HTML completa, con estilos minimalistas y la tabla
    const htmlPage = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Historial de Chats</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #1a1a1a; color: #e1e1e1; }
                .container { padding: 2rem; }
                h1 { color: #9c27b0; border-bottom: 2px solid #9c27b0; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
                th, td { padding: 12px 15px; border: 1px solid #333; text-align: left; }
                th { background-color: #9c27b0; color: white; }
                tbody tr { background-color: #2a2a2a; }
                tbody tr:nth-child(even) { background-color: #242424; }
                tbody tr:hover { background-color: #444; }
                td { word-break: break-word; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Historial de Chats</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Remitente</th>
                            <th>Mensaje</th>
                            <th>Status</th>
                            <th>Tipo</th>
                            <th>Fuente</th>
                             <th>Clase</th> </tr>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    // 3. Enviamos la respuesta como HTML en lugar de JSON
    console.log('[LogController] ✅ Petición exitosa. Enviando tabla HTML.');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlPage);

  } catch (error) {
    console.error('[LogController] 🔴 Error al obtener todos los chats:', error);
    res.status(500).send('<h1>Error 500: No se pudo generar el historial de chats.</h1>');
  }
};

// Asegúrate de que module.exports incluya la función
module.exports = {
  logChatMessage,
  getAllChats,
};