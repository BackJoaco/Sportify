import {Turno, Actividad, Reserva} from '../models/index.model.js';

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

export async function getById(id) {
  return Turno.findByPk(id, {
    include: [
      {
        model: Reserva
      },
      {
        model: Actividad,
        attributes: ['id', 'nombre']
      }
    ]
  });
}

export async function remove(id) {
  return Turno.destroy({ where: { id } });
}