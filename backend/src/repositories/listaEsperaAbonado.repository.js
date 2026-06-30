import { ListaEsperaAbonado, Usuario } from '../models/index.model.js';

export async function create(data) {
  return ListaEsperaAbonado.create(data);
}

export async function countActivasByTurno(turnoId) {
  return ListaEsperaAbonado.count({
    where: {
      turno_id: turnoId,
      estado: ['EN_ESPERA', 'CUPO_RESERVADO']
    }
  });
}

export async function findActiva(usuarioId, turnoId) {
  return ListaEsperaAbonado.findOne({
    where: {
      usuario_id: usuarioId,
      turno_id: turnoId,
      estado: ['EN_ESPERA', 'CUPO_RESERVADO']
    }
  });
}

export async function findSiguienteEnEspera(turnoId) {
  return ListaEsperaAbonado.findOne({
    where: {
      turno_id: turnoId,
      estado: 'EN_ESPERA'
    },
    order: [['posicion', 'ASC'], ['createdAt', 'ASC']]
  });
}

export async function findByTurno(turnoId) {
  return ListaEsperaAbonado.findAll({
    where: { turno_id: turnoId },
    include: [{
      model: Usuario,
      attributes: { exclude: ['contrasena', 'token_activacion', 'token_expiracion'] }
    }],
    order: [['posicion', 'ASC'], ['createdAt', 'ASC']]
  });
}

export async function updateEstado(id, data) {
  return ListaEsperaAbonado.update(data, { where: { id } });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
  return ListaEsperaAbonado.destroy({
    where: { usuario_id: usuarioId },
    transaction
  });
}
