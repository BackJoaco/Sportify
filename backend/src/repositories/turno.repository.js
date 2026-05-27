import {Turno, Actividad} from '../models/index.model.js';

export async function create(data) {
    return Turno.create(data);
}

const turnos = await Turno.findAll({
    include: [{
        model: Actividad,
        attributes: ['id', 'nombre']
    }]
});
export async function getTurnos() {
    return Turno.findAll({
        include: [{
            model: Actividad,
            attributes: ['id', 'nombre']
        }]
    })
}