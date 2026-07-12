import * as abonadoTurnoService from '../services/abonadoTurno.service.js';
import * as reservaService from '../services/reserva.service.js';
import * as turnoService from '../services/turno.service.js';
import * as usuarioService from '../services/usuario.service.js';
import { getRemainingClassesInSportifyMonth, getMesSportify } from './date.utils.js';

export async function validarPuedeAbonarse(usuarioId, turnoId, fechaBase = new Date()) {
  const usuario = await usuarioService.getProfile(usuarioId);
  const turno = await turnoService.getTurnoById(turnoId);

  if (!usuario) {
    return { puede: false, motivo: 'Usuario no encontrado.' };
  }
  if (!turno) {
    return { puede: false, motivo: 'Turno no encontrado.' };
  }

  if (usuario.rol !== 'CLIENTE') {
    return { puede: false, motivo: 'Solo un cliente puede abonarse a un turno.' };
  }

  // Obtener mes actual Sportify
  let currentMonthInt = getMesSportify(fechaBase);

  // Calcular las fechas restantes en este mes Sportify
  let remainingDates = getRemainingClassesInSportifyMonth(turno.dia_semana, fechaBase);

  // Si no quedan clases en el mes actual, se abona para el mes siguiente
  if (remainingDates.length === 0) {
    const ref = new Date(fechaBase);
    const day = ref.getDate();
    let nextCycleDate = new Date(ref);
    if (day >= 11) {
      nextCycleDate.setMonth(nextCycleDate.getMonth() + 1);
      nextCycleDate.setDate(15);
    } else {
      nextCycleDate.setDate(15);
    }
    remainingDates = getRemainingClassesInSportifyMonth(turno.dia_semana, nextCycleDate);
    currentMonthInt = getMesSportify(nextCycleDate);
  }

  const abonadoExistente = await abonadoTurnoService.findActivoByMes(usuarioId, turnoId, currentMonthInt);
  if (abonadoExistente) {
    return { puede: false, motivo: 'El cliente ya es abonado activo de este turno para este mes.' };
  }

  const abonadoSuspendido = await abonadoTurnoService.findSuspendidoByMes(usuarioId, turnoId, currentMonthInt);
  if (abonadoSuspendido) {
    return { puede: false, motivo: 'El cliente se encuentra suspendido del abono, para regularizar su situacion pague en el home' };
  }

  // Validar si el usuario ya tiene reservas NO_ABONADO futuras en el mes
  for (const fecha of remainingDates) {
    const reservaExistente = await reservaService.findByUsuarioTurnoFecha(usuarioId, turnoId, fecha);
    if (reservaExistente && reservaExistente.estado === 'CONFIRMADA' && reservaExistente.tipo_reserva === 'NO_ABONADO') {
      return { puede: false, motivo: `Ya posees una reserva como no abonado para el día ${fecha}. Si deseas abonarte, por favor cancela tus reservas primero.` };
    }
  }

  // Validar cupos: primero la cantidad global y luego cada clase
  const abonadosActivos = await abonadoTurnoService.countActivosByTurno(turnoId);
  if (abonadosActivos >= turno.cupo_maximo) {
    return { puede: false, motivo: 'El turno no tiene cupos fijos disponibles. No es posible abonarse a este turno, por favor inscríbete a la lista de espera de abonados.', errorGlobal: true };
  }

  for (const fecha of remainingDates) {
    const count = await reservaService.countByTurnoAndFecha(turnoId, fecha);
    if (count >= turno.cupo_maximo) {
      return { puede: false, motivo: `La clase del día ${fecha} ya alcanzó el cupo máximo. No es posible abonarse a este turno, por favor inscríbete a la lista de espera de abonados.`, errorGlobal: true };
    }
  }

  return { puede: true, motivo: '', currentMonthInt, remainingDates };
}
