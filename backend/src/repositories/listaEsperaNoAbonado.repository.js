import { ListaEsperaNoAbonado, Usuario } from '../models/index.model.js';
import { Op } from 'sequelize';

export async function create(data) {
  return ListaEsperaNoAbonado.create(data);
}

export async function countActivasByTurnoFecha(turnoId, fecha) {
  return ListaEsperaNoAbonado.count({
    where: {
      turno_id: turnoId,
      fecha,
      estado: ['EN_ESPERA', 'CUPO_RESERVADO']
    }
  });
}

export async function findActiva(usuarioId, turnoId, fecha) {
  return ListaEsperaNoAbonado.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      fecha,
      estado: ['EN_ESPERA']
    }
  });
}

export async function findSiguienteEnEspera(turnoId, fecha) {
  return ListaEsperaNoAbonado.findOne({
    where: {
      turno_id: turnoId,
      fecha,
      estado: 'EN_ESPERA'
    },
    order: [['posicion', 'ASC'], ['createdAt', 'ASC']]
  });
}

export async function findByTurnoFecha(turnoId, fecha) {
  return ListaEsperaNoAbonado.findAll({
    where: { turno_id: turnoId, fecha },
    include: [{
      model: Usuario,
      attributes: { exclude: ['contrasena', 'token_activacion', 'token_expiracion'] }
    }],
    order: [['posicion', 'ASC'], ['createdAt', 'ASC']]
  });
}

export async function updateEstado(id, data) {
  return ListaEsperaNoAbonado.update(data, { where: { id } });
}

export async function deleteById(id) {
  return ListaEsperaNoAbonado.destroy({
    where: { id }
  });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
  return ListaEsperaNoAbonado.destroy({
    where: { usuario_id: usuarioId },
    transaction
  });
}

export async function countWaiting(turnoId) {
  return ListaEsperaNoAbonado.count({
    where: {
      turno_id: turnoId,
      estado: 'EN_ESPERA'
    }
  });
}

export async function reordenarPosiciones(turnoId, fecha, posicionLiberada) {
  return ListaEsperaNoAbonado.decrement('posicion', {
    by: 1,
    where: {
      turno_id: turnoId,
      fecha,
      posicion: { [Op.gt]: posicionLiberada }
    }
  });
}
