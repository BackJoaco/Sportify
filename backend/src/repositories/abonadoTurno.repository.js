import { AbonadoTurno, Turno, Usuario } from '../models/index.model.js';

export async function create(data) {
  return AbonadoTurno.create(data);
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

export async function countActivosByTurno(turnoId) {
  return AbonadoTurno.count({
    where: {
      turno_id: turnoId,
      estado: 'ACTIVO'
    }
  });
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
    include: [Turno]
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
