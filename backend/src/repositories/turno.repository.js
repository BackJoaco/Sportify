import {Turno, Actividad} from '../models/index.model.js';

export async function create(data) {
    return Turno.create(data);
}

export async function getTurnos() {
    return Turno.findAll({
        include: [{
            model: Actividad,
            attributes: ['id', 'nombre']
        }]
    })
}

export async function existsTurnByActivityId(actividadId) {
    const turno = await Turno.findOne({ where: { actividad_id: actividadId } });

    return !!turno;
}