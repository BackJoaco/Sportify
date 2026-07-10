import { Notificacion } from '../models/index.model.js';
import { Op } from 'sequelize';

export async function findByUsuarioId(usuarioId) {
  return Notificacion.findAll({
    where: { usuario_id: usuarioId },
    order: [['createdAt', 'DESC']]
  });
}

export async function countUnreadByUsuarioId(usuarioId) {
  return Notificacion.count({
    where: {
      usuario_id: usuarioId,
      leida: false
    }
  });
}

export async function markAsRead(id, usuarioId) {
  const [affectedRows] = await Notificacion.update(
    { leida: true },
    {
      where: {
        id,
        usuario_id: usuarioId
      }
    }
  );

  if (!affectedRows) {
    return null;
  }

  return Notificacion.findByPk(id);
}

export async function markAllAsRead(usuarioId) {
  const [affectedRows] = await Notificacion.update(
    { leida: true },
    {
      where: {
        usuario_id: usuarioId,
        leida: false
      }
    }
  );

  return affectedRows;
}

export async function create(data) {
  return Notificacion.create(data);
}

export async function findRepetida(usuarioId, mensaje) {
  return Notificacion.findOne({
    where: {
      usuario_id: usuarioId,
      mensaje,
      leida: false
    }
  });
}

export async function findRepetidaByDia(usuarioId, mensaje, inicioHoy, finHoy) {
  return await Notificacion.findOne({
    where: {
      usuario_id: usuarioId,
      mensaje,
      createdAt: {
        [Op.between]: [inicioHoy, finHoy]
      }
    }
  });
}