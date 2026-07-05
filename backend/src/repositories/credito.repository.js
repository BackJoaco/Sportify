import { Credito } from '../models/index.model.js';
import { Op } from 'sequelize';

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

export async function getCreditoVigente(creditoId, usuarioId, transaction) {
  return await Credito.findOne({
    where: {
      id: creditoId,
      usuario_id: usuarioId,
      estado: 'DISPONIBLE',
      // Regla: Debe estar vigente (vencimiento posterior a ahora)
      fecha_vencimiento: {
        [Op.gt]: new Date()
      }
    },
    transaction
  });
}