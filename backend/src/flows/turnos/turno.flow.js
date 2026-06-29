import * as turnoService from "../../services/turno.service.js";
import * as actividadService from "../../services/actividad.service.js";
import * as reservaService from "../../services/reserva.service.js";
import * as abonadoTurnoService from "../../services/abonadoTurno.service.js";

export async function getReservasCount(turnoId, fecha = null) {
  await turnoService.getTurnoById(turnoId);

  if (fecha) {
    return reservaService.countByTurnoAndFecha(turnoId, fecha);
  }

  return abonadoTurnoService.countActivosByTurno(turnoId);
}

export async function crearTurnoFlow(data) {
  await actividadService.getActividadById(data.actividad_id);
  await turnoService.checkSuperposicion(data.actividad_id, data.dia_semana, data.hora_inicio);

  return turnoService.create({
    ...data,
    dia_semana: String(data.dia_semana ?? '').trim().toUpperCase()
  });
}

export async function modificarTurnoFlow(id, datosNuevos) {
  const turnoExistente = await turnoService.getTurnoById(id);

  const huboCambios =
    (datosNuevos.entrenador && datosNuevos.entrenador !== turnoExistente.entrenador) ||
    (datosNuevos.dia_semana && datosNuevos.dia_semana !== turnoExistente.dia_semana) ||
    (datosNuevos.hora_inicio && datosNuevos.hora_inicio.substring(0, 5) !== turnoExistente.hora_inicio.substring(0, 5)) ||
    (datosNuevos.cupo_maximo && parseInt(datosNuevos.cupo_maximo) !== turnoExistente.cupo_maximo) ||
    (datosNuevos.actividad_id && parseInt(datosNuevos.actividad_id) !== turnoExistente.actividad_id);

  await turnoService.update(id, {
    ...datosNuevos,
    dia_semana: datosNuevos.dia_semana
      ? String(datosNuevos.dia_semana).trim().toUpperCase()
      : undefined
  });

  let reservasCanceladas = 0;
  if (huboCambios) {
    const [afectadas] = await reservaService.cancelarMasivamentePorTurno(id);
    reservasCanceladas = afectadas;
  }

  const turnoActualizado = await turnoService.getTurnoById(id);

  return {
    turno: turnoActualizado,
    impacto: huboCambios,
    reservasCanceladas
  };
}
