import * as reservaRepository from '../repositories/reserva.repository.js';

export async function actualizarEstadoPago(id, estadoPago) {
    const reserva = await reservaRepository.updateEstadoPago(id, estadoPago);

    if (!reserva) {
        throw new Error('Reserva no encontrada');
    }

    return reserva;
}

export async function findById(id) {
    const reserva = await reservaRepository.findById(id);
    if (!reserva) {
        throw new Error("La reserva no existe.");
    }
    return reserva;
}

export async function marcarComoCancelada(id) {
  return reservaRepository.updateEstado(id, 'CANCELADA'); 
}

export async function findByUsuarioId(usuarioId) {
    return reservaRepository.findByUsuarioId(usuarioId);
}

export async function create(data){
    return reservaRepository.create(data);
}

export async function countByTurno(turno_id) {
  return await reservaRepository.countByTurno(turno_id);
}

export async function findActivasByUsuarioAndFecha(usuario_id, fecha) {
  return await reservaRepository.findActivasByUsuarioAndFecha(usuario_id, fecha);
}

export async function cancelarMasivamentePorTurno(turno_id) {
  return await reservaRepository.cancelarMasivamentePorTurno(turno_id);
}