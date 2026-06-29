import * as listaEsperaNoAbonadoRepository from '../repositories/listaEsperaNoAbonado.repository.js';

export async function agregar(usuarioId, turnoId, fecha) {
  const existente = await listaEsperaNoAbonadoRepository.findActiva(usuarioId, turnoId, fecha);
  if (existente) {
    return existente;
  }

  const posicion = (await listaEsperaNoAbonadoRepository.countActivasByTurnoFecha(turnoId, fecha)) + 1;
  return listaEsperaNoAbonadoRepository.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    fecha,
    posicion
  });
}

export function findSiguienteEnEspera(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findSiguienteEnEspera(turnoId, fecha);
}

export function findByTurnoFecha(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findByTurnoFecha(turnoId, fecha);
}

export function reservarCupo(id) {
  const hasta = new Date();
  hasta.setHours(hasta.getHours() + 24);
  return listaEsperaNoAbonadoRepository.updateEstado(id, {
    estado: 'CUPO_RESERVADO',
    cupo_reservado_hasta: hasta
  });
}

export function confirmar(id) {
  return listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'CONFIRMADO' });
}

export function deleteByUsuarioId(usuarioId, transaction) {
  return listaEsperaNoAbonadoRepository.deleteByUsuarioId(usuarioId, transaction);
}
