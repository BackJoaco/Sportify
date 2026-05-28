import * as reservaRepository from '../repositories/reserva.repository.js';

export async function actualizarEstadoPago(id, estadoPago) {
    const reserva = await reservaRepository.updateEstadoPago(id, estadoPago);

    if (!reserva) {
        throw new Error('Reserva no encontrada');
    }

    return reserva;
}

export async function findById(id) {
    return reservaRepository.findById(id);
}

export async function findByUsuarioId(usuarioId) {
    return reservaRepository.findByUsuarioId(usuarioId);
}

export async function countByTurno(turnoId) {
  return reservaRepository.countByTurnoId(turnoId);
}