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

export async function modificarTurnoFlow(id, datosNuevos) {
  // 1. Verificar que el turno exista
  const turnoExistente = await turnoService.getTurnoById(id);
  if (!turnoExistente) {
    throw new Error('El turno que intenta modificar no existe.');
  }

  const fechaHoraTurno = new Date(`${turnoExistente.fecha}T${turnoExistente.hora_inicio}`);
  const ahora = new Date();
  if (fechaHoraTurno < ahora) {
    throw new Error('No se puede modificar un turno que ya pasó o está en curso.');
  }

  // 2. Verificar si hubo cambios reales en los datos críticos
  // Comparamos lo que llega en el body vs lo que está en la base de datos
  const huboCambios = 
    (datosNuevos.entrenador && datosNuevos.entrenador !== turnoExistente.entrenador) ||
    (datosNuevos.fecha && datosNuevos.fecha !== turnoExistente.fecha) ||
    // Al comparar la hora, extraemos solo HH:MM:SS en caso de que venga con formato raro
    (datosNuevos.hora_inicio && datosNuevos.hora_inicio.substring(0, 5) !== turnoExistente.hora_inicio.substring(0, 5)) ||
    (datosNuevos.cupo_maximo && parseInt(datosNuevos.cupo_maximo) !== turnoExistente.cupo_maximo) ||
    (datosNuevos.actividad_id && parseInt(datosNuevos.actividad_id) !== turnoExistente.actividad_id);

  // 3. Actualizamos el turno
  await turnoService.update(id, datosNuevos);

  // 4. Si detectamos modificaciones reales, aplicamos la regla de negocio: DAR DE BAJA
  let reservasCanceladas = 0;
  if (huboCambios) {
    const [afectadas] = await reservaService.cancelarMasivamentePorTurno(id);
    reservasCanceladas = afectadas;
    
    // NOTA A FUTURO: Acá sería el lugar perfecto para llamar a un "emailService" 
    // y notificarle a los usuarios que su turno fue modificado/cancelado.
  }

  // 5. Retornar el turno actualizado y un aviso de lo que pasó con las reservas
  const turnoActualizado = await turnoService.getTurnoById(id);
  
  return {
    turno: turnoActualizado,
    impacto: huboCambios,
    reservasCanceladas
  };
}