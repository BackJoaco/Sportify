import * as turnoService from "../../services/turno.service.js";
import * as reservaService from "../../services/reserva.service.js";

export async function getReservasCount(turnoId) {
  // 1. Validamos que el turno exista utilizando el servicio de turno
  // (getTurnoById ya lanza un error si no lo encuentra)
  await turnoService.getTurnoById(turnoId);

  // 2. Si existe, delegamos el conteo al servicio de reservas
  return reservaService.countByTurno(turnoId);
}