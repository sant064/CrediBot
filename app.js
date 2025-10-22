// index.js

require('dotenv').config();
require('./src/config/redisClient.js');
require('./src/config/pocketbaseClient.js');

const { initBrowser } = require('./src/services/cedulaService.js'); 

const express = require('express');

// --- 1. Importa los nuevos archivos de rutas ---
const instanceRoutes = require('./src/api/routes/instance.routes.js');
const logRoutes = require('./src/api/routes/log.routes.js');
const aiRoutes = require('./src/api/routes/ai.routes.js');
const sessionRoutes = require('./src/api/routes/session.routes.js')
const configRoutes = require('./src/api/routes/config.routes.js');
const cedulaRoutes = require('./src/api/routes/cedula.routes.js');
const whatsappRoutes = require('./src/api/routes/whatsapp.routes.js')
const loanRoutes = require('./src/api/routes/loan.routes.js')
//const invoiceRoutes = require('./routes/invoice.routes.js');


const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[Servidor] Petición entrante: ${req.method} ${req.url}`);
    next();
});

// --- 2. Usa las rutas con un prefijo ---
// Le decimos a Express:
// "Para cualquier URL que empiece con /api/instance, usa las reglas de instanceRoutes"
//app.use('/api/instance', instanceRoutes); // -----------quiero eliminar temporalmente para que no cree instancias nuevas
app.use('/api/log', logRoutes);//para manejar logs de conversaciones
app.use('/api/ai', aiRoutes); //para manejar peticiones de IA
app.use('/api/session', sessionRoutes); //para manejar sesiones de usuarios
app.use('/api/config', configRoutes); //para optener configuraciones dinámicas por ahora solo sms de bienvenida
app.use('/api/cedula', cedulaRoutes); //para validar y extraer datos de cédulas
app.use('/api/whatsapp', whatsappRoutes) // para controlar envio de mensajes whatsapp
//app.use('/api/loan', loanRoutes);// -----------quiero eliminar temporalmente para que no cree instancias nuevas
//app.use('/api/invoices', invoiceRoutes);// -----------quiero eliminar temporalmente para que no cree instancias nuevas


// --- 3. Inicia el Servidor ---
const PORT = process.env.PORT || 3050;
app.listen(PORT, async () => {
    // --- AÑADE ESTA LÍNEA ---
    await initBrowser(); // Inicia Puppeteer al arrancar el servidor

    console.log(`🚀 Backend del Chatbot escuchando en el puerto ${PORT}`);
});