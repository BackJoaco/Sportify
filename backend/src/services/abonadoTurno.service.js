import * as abonadoTurnoRepository from '../repositories/abonadoTurno.repository.js';

export function create(data) {
  return abonadoTurnoRepository.create(data);
}

export function findActivo(usuarioId, turnoId) {
  return abonadoTurnoRepository.findActivo(usuarioId, turnoId);
}

export function findActivosByTurno(turnoId) {
  return abonadoTurnoRepository.findActivosByTurno(turnoId);
}

export function countActivosByTurno(turnoId) {
  return abonadoTurnoRepository.countActivosByTurno(turnoId);
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
