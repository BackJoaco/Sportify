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

export async function deleteByUsuarioId(usuarioId, transaction) {
    return reservaRepository.deleteByUsuarioId(usuarioId, transaction);
}

export async function countByTurno(turno_id) {
  return await reservaRepository.countByTurno(turno_id);
}

export async function countByTurnoAndFecha(turno_id, fecha, tipo_reserva = null) {
  return await reservaRepository.countByTurnoAndFecha(turno_id, fecha, tipo_reserva);
}

export async function countByTurnoFechaTipoEstado(turno_id, fecha, tipo_reserva, estado) {
  return reservaRepository.countByTurnoFechaTipoEstado(turno_id, fecha, tipo_reserva, estado);
}

export async function countByTurnoFechaTipoEstadoUsuarios(turno_id, fecha, tipo_reserva, estado, usuarioIds) {
  return reservaRepository.countByTurnoFechaTipoEstadoUsuarios(
    turno_id,
    fecha,
    tipo_reserva,
    estado,
    usuarioIds
  );
}

export async function findByTurnoFecha(turno_id, fecha) {
  return reservaRepository.findByTurnoFecha(turno_id, fecha);
}

export async function findActivasByUsuarioAndFecha(usuario_id, fecha) {
  return await reservaRepository.findActivasByUsuarioAndFecha(usuario_id, fecha);
}

export async function findByUsuarioTurnoFecha(usuario_id, turno_id, fecha) {
  return reservaRepository.findByUsuarioTurnoFecha(usuario_id, turno_id, fecha);
}

export async function convertirReservasFuturasNoAbonadoAAbonado(usuario_id, turno_id) {
  return reservaRepository.convertirReservasFuturasNoAbonadoAAbonado(usuario_id, turno_id);
}

export async function cancelarReservasFuturasAbonadoByUsuarioTurno(usuario_id, turno_id) {
  return reservaRepository.cancelarReservasFuturasAbonadoByUsuarioTurno(usuario_id, turno_id);
}

export async function cancelarMasivamentePorTurno(turno_id) {
  return await reservaRepository.cancelarMasivamentePorTurno(turno_id);
}
