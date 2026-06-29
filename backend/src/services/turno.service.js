import * as turnoRepository from '../repositories/turno.repository.js';

const regexHoraEnPunto = /^(0[8-9]|1[0-9]|20):00(?::00)?$/;
const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

function obtenerMinutosHora(horaInicio) {
  const [horas, minutos] = String(horaInicio).split(':').map(Number);
  return horas * 60 + minutos;
}

async function validarDatosTurno(data, excludeId = null) {
    const entrenador = String(data.entrenador ?? "").trim();

    if (!entrenador) {
        throw new Error("El nombre del entrenador es obligatorio.");
    }

    const diaSemana = String(data.dia_semana ?? '').trim().toUpperCase();
    if (!DIAS_SEMANA.includes(diaSemana)) {
        throw new Error("El dia de la semana del turno es obligatorio.");
    }

    if (!data.hora_inicio || !regexHoraEnPunto.test(data.hora_inicio)) {
        throw new Error("La hora de inicio debe ser en punto y estar entre las 08:00 y las 20:00.");
    }

    if (data.cupo_maximo <= 0) {
        throw new Error("El cupo máximo debe ser mayor a 0.");
    }

    const turnosMismaActividad = await turnoRepository.getByActividadDia(
        data.actividad_id,
        diaSemana,
        excludeId
    );

    const minutosTurno = obtenerMinutosHora(data.hora_inicio);
    const turnoCercano = turnosMismaActividad.find((turno) => {
        const minutosOtroTurno = obtenerMinutosHora(turno.hora_inicio);
        const diferenciaMinutos = Math.abs(minutosTurno - minutosOtroTurno);
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

  const abonados = turno.AbonadoTurnos || turno.abonados_turnos;
  if (abonados && abonados.some((abonado) => abonado.estado === 'ACTIVO')) {
    throw new Error("No se puede eliminar un turno que tiene abonados activos.");
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

export async function checkSuperposicion(actividad_id, dia_semana, hora_inicio) {
  const turnoExistente = await turnoRepository.getByActividadDiaHora(
    actividad_id,
    String(dia_semana ?? '').trim().toUpperCase(),
    hora_inicio
  );
  
  if (turnoExistente) {
    throw new Error("Ya existe un turno para esta actividad en la fecha y horario seleccionados.");
  }
}

export async function update(id, datosNuevos) {
  const turno = await turnoRepository.getById(id);
  if (!turno) {
    throw new Error("El turno no existe.");
  }

  const datosCompletos = {
    actividad_id: datosNuevos.actividad_id ?? turno.actividad_id,
    entrenador: datosNuevos.entrenador ?? turno.entrenador,
    dia_semana: datosNuevos.dia_semana ?? turno.dia_semana,
    hora_inicio: datosNuevos.hora_inicio ?? turno.hora_inicio,
    cupo_maximo: datosNuevos.cupo_maximo ?? turno.cupo_maximo
  };

  await validarDatosTurno(datosCompletos, id);

  const updates = Object.fromEntries(
    Object.entries(datosNuevos).filter(([, value]) => value !== undefined)
  );

  return await turnoRepository.update(id, updates);
}
