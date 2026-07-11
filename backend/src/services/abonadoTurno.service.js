import * as abonadoTurnoRepository from '../repositories/abonadoTurno.repository.js';

export function create(data, options = {}) {
  return abonadoTurnoRepository.create(data, options);
}

export function findById(id) {
  return abonadoTurnoRepository.findById(id);
}

export function findActivo(usuarioId, turnoId) {
  return abonadoTurnoRepository.findActivo(usuarioId, turnoId);
}

export function findSuspendido(usuarioId, turnoId) {
  return abonadoTurnoRepository.findSuspendido(usuarioId, turnoId);
}

export function findActivosByTurno(turnoId) {
  return abonadoTurnoRepository.findActivosByTurno(turnoId);
}

export function countActivosByTurno(turnoId) {
  return abonadoTurnoRepository.countActivosByTurno(turnoId);
}

export function updateCancelaciones(id, cancelaciones, estado) {
  return abonadoTurnoRepository.updateCancelaciones(id, cancelaciones, estado);
}

export function darDeBaja(id) {
  return abonadoTurnoRepository.darDeBaja(id);
}

export function findByUsuarioId(usuarioId) {
  return abonadoTurnoRepository.findByUsuarioId(usuarioId);
}

export function findSuspendedByUsuarioId(usuarioId) {
  return abonadoTurnoRepository.findSuspendedByUsuarioId(usuarioId);
}

export function deleteByUsuarioId(usuarioId, transaction) {
  return abonadoTurnoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export function findActivosByMes(mes) {
  return abonadoTurnoRepository.findActivosByMes(mes);
}

export function findActivoByMes(usuarioId, turnoId, mes) {
  return abonadoTurnoRepository.findActivoByMes(usuarioId, turnoId, mes);
}

export function findActivoOSuspendidoByMes(usuarioId, turnoId, mes) {
  return abonadoTurnoRepository.findActivoOSuspendidoByMes(usuarioId, turnoId, mes);
}
