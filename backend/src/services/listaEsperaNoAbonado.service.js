import * as listaEsperaNoAbonadoRepository from '../repositories/listaEsperaNoAbonado.repository.js';
import * as notificacionService from './notificacion.service.js';

export async function agregar(usuarioId, turnoId, fecha) {
  const existente = await listaEsperaNoAbonadoRepository.findActiva(usuarioId, turnoId, fecha);
  if (existente) {
    return existente;
  }

  const posicion = (await listaEsperaNoAbonadoRepository.countActivasByTurnoFecha(turnoId, fecha)) + 1;
  const result = await listaEsperaNoAbonadoRepository.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    fecha,
    posicion
  });

  await notificacionService.verificarYNotificarAltaDemanda(turnoId);

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

export function reservarCupo(id, horas = 24) {
  const hasta = new Date();
  hasta.setHours(hasta.getHours() + horas);
  return listaEsperaNoAbonadoRepository.updateEstado(id, {
    estado: 'CUPO_RESERVADO',
    cupo_reservado_hasta: hasta
  });
}

export function confirmar(id) {
  return listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'CONFIRMADO' });
}

export function deleteById(id) {
  return listaEsperaNoAbonadoRepository.deleteById(id);
}

export function deleteByUsuarioId(usuarioId, transaction) {
  return listaEsperaNoAbonadoRepository.deleteByUsuarioId(usuarioId, transaction);
}
