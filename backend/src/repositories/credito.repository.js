import { Credito } from '../models/index.model.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return Credito.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}

export async function create(data) {
    return Credito.create(data);
}

export async function getHistorialByUsuario(usuarioId) {
  return await Credito.findAll({
    where: {
      usuario_id: usuarioId
    },
    order: [
      ['createdAt', 'DESC'] // Del más nuevo al más viejo
    ]
  });
}
