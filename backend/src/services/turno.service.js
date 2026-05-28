import * as turnoRepository from '../repositories/turno.repository.js';

export async function create(data) {
    const regexHoraEnPunto = /^(0[8-9]|1[0-9]|20):00(?::00)?$/;

    if (!data.hora_inicio || !regexHoraEnPunto.test(data.hora_inicio)) {
        throw new Error("La hora de inicio debe ser en punto y estar entre las 08:00 y las 20:00.");
    }

    if (data.cupo_maximo <= 0) {
        throw new Error("El cupo máximo debe ser mayor a 0.");
    }

    const fechaTurno = new Date(`${data.fecha}T${data.hora_inicio}`);
    if (fechaTurno <= new Date()) {
        throw new Error("La fecha y hora del turno deben ser posteriores al momento actual.");
    }

    return turnoRepository.create(data);
}

export async function getTurnos(){
    return turnoRepository.getTurnos();
}

export async function existsTurnByActivityId(actividadId) {
    return turnoRepository.existsTurnByActivityId(actividadId);
}