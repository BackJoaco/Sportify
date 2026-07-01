import { Op } from 'sequelize';
import {Turno, Actividad, Reserva, AbonadoTurno, ListaEsperaAbonado, ListaEsperaNoAbonado} from '../models/index.model.js';

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
        model: AbonadoTurno
      },
      {
        model: ListaEsperaAbonado
      },
      {
        model: ListaEsperaNoAbonado
      },
      {
        model: Actividad,
        attributes: ['id', 'nombre', 'precio_clase', 'precio_mensual']
      }
    ]
  });
}

export async function remove(id) {
  return Turno.destroy({ where: { id } });
}
export async function getByActividadDiaHora(actividad_id, dia_semana, hora_inicio) {
  return Turno.findOne({
    where: { actividad_id, dia_semana, hora_inicio }
  });
}

export async function getByActividadDia(actividad_id, dia_semana, excludeId = null) {
  const where = { actividad_id, dia_semana };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  return Turno.findAll({ where });
}

export async function update(id, datosNuevos) {
  const [affectedRows] = await Turno.update(datosNuevos, {
    where: { id }
  });
  return affectedRows;
}
