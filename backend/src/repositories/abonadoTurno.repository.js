import { Op } from 'sequelize';
import { AbonadoTurno, Turno, Usuario, Actividad, Pago } from '../models/index.model.js';

export async function create(data, options = {}) {
  return AbonadoTurno.create(data, options);
}

export async function findById(id) {
  return AbonadoTurno.findByPk(id);
}

export async function findActivo(usuarioId, turnoId) {
  return AbonadoTurno.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      estado: 'ACTIVO'
    }
  });
}

export async function findSuspendido(usuarioId, turnoId) {
  return AbonadoTurno.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      estado: 'SUSPENDIDO'
    }
  });
}

export async function findActivosByTurno(turnoId) {
  return AbonadoTurno.findAll({
    where: {
      turno_id: turnoId,
      estado: 'ACTIVO'
    },
    include: [{
      model: Usuario,
      attributes: { exclude: ['contrasena', 'token_activacion', 'token_expiracion'] }
    }],
    order: [['createdAt', 'ASC']]
  });
}

export async function findActivosYSuspendidosByTurno(turnoId) {
  return AbonadoTurno.findAll({
    where: {
      turno_id: turnoId,
      [Op.or]: [{ estado: 'ACTIVO' }, { estado: 'SUSPENDIDO' }]
    },
    include: [{
      model: Usuario,
      attributes: { exclude: ['contrasena', 'token_activacion', 'token_expiracion'] }
    }],
    order: [['createdAt', 'ASC']]
  });
}

export async function countActivosByTurno(turnoId) {
  return AbonadoTurno.count({
    where: {
      turno_id: turnoId,
      estado: 'ACTIVO'
    }
  });
}

export async function updateCancelaciones(id, cancelaciones, estado) {
  return AbonadoTurno.update(
    { cancelaciones_mes: cancelaciones, estado },
    { where: { id } }
  );
}

export async function updateEstado(id, estado, transaction) {
  return AbonadoTurno.update(
    { estado },
    { where: { id }, transaction }
  );
}

export async function quitarDescuento(id) {
  return AbonadoTurno.update(
    { pierde_descuento: 1 },
    { where: { id } }
  );
}

export async function darDeBaja(id) {
  return AbonadoTurno.update(
    {
      estado: 'BAJA',
      fecha_baja: new Date()
    },
    { where: { id } }
  );
}

export async function findByUsuarioId(usuarioId) {
  return AbonadoTurno.findAll({
    where: { usuario_id: usuarioId },
    include: [
      {
        model: Turno,
        include: [Actividad]
      },
      {
        model: Pago,
        where: { estado: 'PENDIENTE', tipo_pago: 'SUSCRIPCION_MENSUAL' },
        required: false
      }
    ]
  });
}

export async function findSuspendedByUsuarioId(usuarioId) {
  return AbonadoTurno.findAll({
    where: {
      usuario_id: usuarioId,
      estado: 'SUSPENDIDO'
    },
    include: [Turno]
  });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
  return AbonadoTurno.destroy({
    where: { usuario_id: usuarioId },
    transaction
  });
}

export async function findActivosByMes(mes) {
  return AbonadoTurno.findAll({
    where: {
      mes_anio: mes,
      estado: 'ACTIVO'
    }
  });
}

export async function findActivoByMes(usuarioId, turnoId, mes) {
  return AbonadoTurno.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      mes_anio: mes,
      estado: 'ACTIVO'
    }
  });
}

export async function findSuspendidoByMes(usuarioId, turnoId, mes) {
  return AbonadoTurno.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      mes_anio: mes,
      estado: 'SUSPENDIDO'
    }
  });
}

export async function findActivoOSuspendidoByMes(usuarioId, turnoId, mes) {
  return AbonadoTurno.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      mes_anio: mes,
      estado: {
        [Op.in]: ['ACTIVO', 'SUSPENDIDO']
      }
    }
  });
}
