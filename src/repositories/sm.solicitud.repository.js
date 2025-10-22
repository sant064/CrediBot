// /repositories/solicitud.repository.js

const pb = require('../config/pocketbaseClient');
const COLLECTION_NAME = 'solicitudes_prestamo';

const findBytelefono = async (telefono) => {
  try {
    const record = await pb.collection(COLLECTION_NAME).getFirstListItem(`telefono="${telefono}"`);
    return record;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

const create = async (data) => {
  return await pb.collection(COLLECTION_NAME).create(data);
};

const update = async (id, data) => {
  return await pb.collection(COLLECTION_NAME).update(id, data);
};

module.exports = {
  findBytelefono,
  create,
  update,
};