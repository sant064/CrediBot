// /stateHandlers/handle_finalizar_solicitud.js
const loanRepository = require('../../../repositories/loanRepository');
//const notificationService = require('../services/notificationService');

async function handle(solicitud) {
    await loanRepository.updateLoanApplication(solicitud.id, { estado_solicitud: 'FINALIZADO' });

    const resumen = `Nueva Solicitud para Análisis:\nCliente: ${solicitud.nombre_completo || 'N/A'}\nCédula: ${solicitud.cedula || 'N/A'}\nTeléfono: ${solicitud.telefono_contacto}\nMonto: ${solicitud.monto_solicitado || 'N/A'}`;
    
   // await notificationService.sendToAnalyst(resumen);
    
    return { next_message: "¡Excelente! Hemos recibido toda tu información y tu solicitud ha sido enviada para análisis. Un agente se pondrá en contacto contigo muy pronto." };
}
module.exports = { handle };