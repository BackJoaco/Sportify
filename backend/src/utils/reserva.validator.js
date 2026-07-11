import * as reservaService from '../services/reserva.service.js';

function normalizarHora(hora) {
  return String(hora ?? '').slice(0, 5);
}

export async function buscarSuperposicionHoraria(usuarioId, horaInicio, fechas) {
  const horaNormalizada = normalizarHora(horaInicio);

  for (const fecha of fechas) {
    const reservasActivas = await reservaService.findActivasByUsuarioAndFecha(usuarioId, fecha);
    const reservaSuperpuesta = reservasActivas.find(
      reserva => normalizarHora(reserva.Turno?.hora_inicio) === horaNormalizada
    );

    if (reservaSuperpuesta) {
      return {
        fecha,
        reserva: reservaSuperpuesta
      };
    }
  }

  return null;
}
