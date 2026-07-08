import * as listaEsperaAbonadoRepository from '../repositories/listaEsperaAbonado.repository.js';

export async function agregar(usuarioId, turnoId) {
  // Buscamos si existe (activo o borrado)
  const existente = await listaEsperaAbonadoRepository.findByUsuarioTurnoConBorrados(usuarioId, turnoId);

  const posicion = (await listaEsperaAbonadoRepository.countActivasByTurno(turnoId)) + 1;

  if (existente) {
    // Si el registro estaba eliminado, lo restauramos y reiniciamos sus valores
    if (existente.deletedAt) {
      await existente.restore();
      existente.estado = 'EN_ESPERA';
      existente.posicion = posicion;
      await existente.save();
    }
    return existente;
  }

  const result = await listaEsperaAbonadoRepository.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    posicion
  });

  return result;
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

export function reservarCupo(id, horas = 24) {
  const hasta = new Date();
  hasta.setHours(hasta.getHours() + horas);
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

export function countWaiting(turnoId){
  return listaEsperaAbonadoRepository.countWaiting(turnoId)
}