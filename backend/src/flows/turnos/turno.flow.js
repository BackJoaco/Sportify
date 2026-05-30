import * as turnoService from "../../services/turno.service.js";
import * as actividadService from "../../services/actividad.service.js";
import * as reservaService from "../../services/reserva.service.js";

export async function getReservasCount(turnoId) {
  // 1. Validamos que el turno exista utilizando el servicio de turno
  // (getTurnoById ya lanza un error si no lo encuentra)
  await turnoService.getTurnoById(turnoId);

  // 2. Si existe, delegamos el conteo al servicio de reservas
  return reservaService.countByTurno(turnoId);
}

export async function crearTurnoFlow(data) {
  // 1. Validar que la actividad a la que se le asigna el turno exista
  await actividadService.getActividadById(data.actividad_id);

  // 2. Validar que no haya superposición para esa actividad específica
  await turnoService.checkSuperposicion(data.actividad_id, data.fecha, data.hora_inicio);

  // 3. Ejecutar las validaciones internas de turno y guardarlo en base de datos
  return turnoService.create(data);
}