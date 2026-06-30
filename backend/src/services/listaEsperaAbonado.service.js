import * as listaEsperaAbonadoRepository from '../repositories/listaEsperaAbonado.repository.js';

export async function agregar(usuarioId, turnoId) {
  const existente = await listaEsperaAbonadoRepository.findActiva(usuarioId, turnoId);
  if (existente) {
    return existente;
  }

  const posicion = (await listaEsperaAbonadoRepository.countActivasByTurno(turnoId)) + 1;
  return listaEsperaAbonadoRepository.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    posicion
  });
}

export function findSiguienteEnEspera(turnoId) {
  return listaEsperaAbonadoRepository.findSiguienteEnEspera(turnoId);
}

export function findByTurno(turnoId) {
  return listaEsperaAbonadoRepository.findByTurno(turnoId);
}

export function findActiva(usuarioId, turnoId) {
  return listaEsperaAbonadoRepository.findActiva(usuarioId, turnoId);
}

export function reservarCupo(id) {
  const hasta = new Date();
  hasta.setHours(hasta.getHours() + 24);
  return listaEsperaAbonadoRepository.updateEstado(id, {
    estado: 'CUPO_RESERVADO',
    cupo_reservado_hasta: hasta
  });
}

export function confirmar(id) {
  return listaEsperaAbonadoRepository.updateEstado(id, { estado: 'CONFIRMADO' });
}

export function deleteById(id) {
  return listaEsperaAbonadoRepository.deleteById(id);
}

export function deleteByUsuarioId(usuarioId, transaction) {
  return listaEsperaAbonadoRepository.deleteByUsuarioId(usuarioId, transaction);
}
