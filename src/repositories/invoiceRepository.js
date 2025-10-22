// /repositories/invoiceRepository.js

const pb = require('../config/pocketbaseClient');

// IMPORTANTE: Reemplaza esto con el ID real de tu colección "facturas"
const COLLECTION_ID = 'ID_DE_TU_COLECCION_FACTURAS'; 

/**
 * Busca la factura más reciente de una instancia.
 */
async function getLatestInvoiceByInstance(instanceId) {
  try {
    console.log(`[InvoiceRepo] 🔎 Buscando última factura para la instancia: "${instanceId}"`);
    const record = await pb.collection(COLLECTION_ID).getFirstListItem(`instancia = "${instanceId}"`, {
        sort: '-vencimiento', 
    });
    return record;
  } catch (error) {
    if (error.status === 404) {
      console.warn(`[InvoiceRepo] ⚠️ Factura no encontrada para la instancia "${instanceId}".`);
      return null;
    }
    console.error(`[InvoiceRepo] 🔴 Error obteniendo la factura:`, error);
    throw error;
  }
}

/**
 * Obtiene TODAS las facturas de una instancia, ordenadas por fecha.
 */
async function getAllInvoicesByInstance(instanceId) {
  try {
    console.log(`[InvoiceRepo] 🔎 Buscando TODO el historial de facturas para: "${instanceId}"`);
    const records = await pb.collection(COLLECTION_ID).getFullList({
        filter: `instancia = "${instanceId}"`,
        sort: 'vencimiento',
    });
    return records;
  } catch (error) {
    console.error(`[InvoiceRepo] 🔴 Error obteniendo el historial de facturas:`, error);
    throw error;
  }
}

/**
 * Crea una nueva factura para una instancia, incluyendo servicio y perfil.
 */
async function createInvoice(instanceId, data = {}) {
  try {
    console.log(`[InvoiceRepo] 🏭 Creando nueva factura para la instancia: "${instanceId}"`);
    
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 30);

    const newInvoiceData = {
        instancia: instanceId,
        pagado: false,
        vencimiento: vencimiento.toISOString(),
        numero: `FACT-${instanceId}-${Date.now()}`,
        servicio: data.servicio || 'default', 
        perfil: data.perfil || 'standard'
    };

    const record = await pb.collection(COLLECTION_ID).create(newInvoiceData);
    console.log(`[InvoiceRepo] ✅ Nueva factura creada con ID: ${record.id}`);
    return record;

  } catch (error) {
    console.error(`[InvoiceRepo] 🔴 Error creando la factura:`, error);
    throw error;
  }
}

module.exports = { 
  getLatestInvoiceByInstance,
  getAllInvoicesByInstance,
  createInvoice
};