import { Credito } from '../models/index.model.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

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

export async function getUsuariosConCreditosPorVencer() {
  const creditos = await Credito.findAll({
    attributes: ['usuario_id'],
    where: {
      estado: 'DISPONIBLE',
      [Op.and]: [
        sequelize.where(
          sequelize.fn('DATE', sequelize.col('fecha_vencimiento')),
          sequelize.fn('CURDATE')
        )
      ]
    },
    raw: true 
  });
  // Retorna un array con IDs de usuarios únicos, ej: [3, 14, 25]
  return [...new Set(creditos.map(c => c.usuario_id))];
}

export async function getPrimerCreditoVigente(usuarioId, transaction) {
  return await Credito.findOne({
    where: {
      usuario_id: usuarioId,
      estado: 'DISPONIBLE',
      fecha_vencimiento: {
        [Op.gt]: new Date()
      }
    },
    order: [['fecha_vencimiento', 'ASC']],
    transaction
  });
}