import * as listaEsperaNoAbonadoRepository from '../repositories/listaEsperaNoAbonado.repository.js';

export async function agregar(usuarioId, turnoId, fecha) {
  // Buscamos si existe (activo o borrado)
  const existente = await listaEsperaNoAbonadoRepository.findByUsuarioTurnoFechaConBorrados(usuarioId, turnoId, fecha);

  const posicion = (await listaEsperaNoAbonadoRepository.countActivasByTurnoFecha(turnoId, fecha)) + 1;

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

  // Si no existía de antes, creamos uno nuevo
  const result = await listaEsperaNoAbonadoRepository.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    fecha: fecha,
    posicion
  });

  return result;
}


export function findSiguienteEnEspera(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findSiguienteEnEspera(turnoId, fecha);
}

export function findByTurnoFecha(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findByTurnoFecha(turnoId, fecha);
}

export function findActiva(usuarioId, turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findActiva(usuarioId, turnoId, fecha);
}

export function findConfirmada(usuarioId, turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findConfirmada(usuarioId, turnoId, fecha);
}

export function notificar(id, horas = 1) {
  const hasta = new Date();
  hasta.setHours(hasta.getHours() + horas);
  return listaEsperaNoAbonadoRepository.updateEstado(id, {
    estado: 'NOTIFICADO',
    cupo_reservado_hasta: hasta
  });
}

export function confirmar(id) {
  return listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'CONFIRMADO' });
}

export function expirar(id) {
  return listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'EXPIRADO' });
}

export function deleteById(id) {
  return listaEsperaNoAbonadoRepository.deleteById(id);
}

export function deleteByUsuarioId(usuarioId, transaction) {
  return listaEsperaNoAbonadoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export function reordenarPosiciones(turnoId, fecha, posicionLiberada) {
  return listaEsperaNoAbonadoRepository.reordenarPosiciones(turnoId, fecha, posicionLiberada);
}

export function countWaiting(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.countWaiting(turnoId, fecha);
}
