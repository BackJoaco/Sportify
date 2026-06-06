import * as turnoRepository from '../repositories/turno.repository.js';

const regexHoraEnPunto = /^(0[8-9]|1[0-9]|20):00(?::00)?$/;

function obtenerFechaHora(fecha, horaInicio) {
  return new Date(`${fecha}T${horaInicio}`);
}

async function validarDatosTurno(data, excludeId = null) {
    if (!data.fecha) {
        throw new Error("La fecha del turno es obligatoria.");
    }

    if (!data.hora_inicio || !regexHoraEnPunto.test(data.hora_inicio)) {
        throw new Error("La hora de inicio debe ser en punto y estar entre las 08:00 y las 20:00.");
    }

    if (data.cupo_maximo <= 0) {
        throw new Error("El cupo máximo debe ser mayor a 0.");
    }

    const fechaTurno = obtenerFechaHora(data.fecha, data.hora_inicio);
    if (fechaTurno <= new Date()) {
        throw new Error("La fecha y hora del turno deben ser posteriores al momento actual.");
    }

    const turnosMismaActividad = await turnoRepository.getByActividadFecha(
        data.actividad_id,
        data.fecha,
        excludeId
    );

    const turnoCercano = turnosMismaActividad.find((turno) => {
        const fechaOtroTurno = obtenerFechaHora(turno.fecha, turno.hora_inicio);
        const diferenciaMinutos = Math.abs(fechaTurno - fechaOtroTurno) / 60000;
        return diferenciaMinutos < 60;
    });

    if (turnoCercano) {
        throw new Error("Debe haber al menos una hora de diferencia entre turnos de la misma actividad.");
    }
}

export async function create(data) {
    await validarDatosTurno(data);

    return turnoRepository.create(data);
}

export async function getTurnos(){
    return turnoRepository.getTurnos();
}

export async function existsTurnByActivityId(actividadId) {
    return turnoRepository.existsTurnByActivityId(actividadId);
}

export async function deleteTurno(id) {
  const turno = await turnoRepository.getById(id);

  if (!turno) {
    throw new Error("El turno no existe.");
  }

  // Verifica si el array de reservas existe y tiene elementos
  const reservas = turno.Reservas || turno.reservas;
  if (reservas && reservas.length > 0) {
    throw new Error("No se puede eliminar un turno que ya tiene reservas.");
  }

  const fechaTurno = new Date(`${turno.fecha}T${turno.hora_inicio}`);
  if (fechaTurno <= new Date()) {
    throw new Error("No se puede eliminar un turno que ya ha comenzado o finalizado.");
  }

  return turnoRepository.remove(id);
}

export async function getTurnoById(id) {
  const turno = await turnoRepository.getById(id);
  
  if (!turno) {
    throw new Error("El turno solicitado no existe.");
  }

  return turno;
}

export async function checkSuperposicion(actividad_id, fecha, hora_inicio) {
  const turnoExistente = await turnoRepository.getByActividadFechaHora(actividad_id, fecha, hora_inicio);
  
  if (turnoExistente) {
    throw new Error("Ya existe un turno para esta actividad en la fecha y horario seleccionados.");
  }
}

export async function update(id, datosNuevos) {
  const turno = await turnoRepository.getById(id);
  console.log('estoy aca')
  if (!turno) {
    throw new Error("El turno no existe.");
  }

  const datosCompletos = {
    actividad_id: datosNuevos.actividad_id ?? turno.actividad_id,
    entrenador: datosNuevos.entrenador ?? turno.entrenador,
    fecha: datosNuevos.fecha ?? turno.fecha,
    hora_inicio: datosNuevos.hora_inicio ?? turno.hora_inicio,
    cupo_maximo: datosNuevos.cupo_maximo ?? turno.cupo_maximo
  };

  await validarDatosTurno(datosCompletos, id);

  return await turnoRepository.update(id, datosNuevos);
}
