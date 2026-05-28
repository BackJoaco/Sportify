import { Actividad, Reserva, Turno } from '../models/index.model.js';

export async function findById(id) {
    return Reserva.findByPk(id);
}

export async function findByUsuarioId(usuarioId) {
    return Reserva.findAll({
        where: { usuario_id: usuarioId },
        include: [
            {
                model: Turno,
                include: [Actividad]
            }
        ],
        order: [
            [Turno, 'fecha', 'ASC'],
            [Turno, 'hora_inicio', 'ASC']
        ]
    });
}

export async function updateEstadoPago(id, estadoPago) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
        return null;
    }

    return reserva.update({ estado_pago: estadoPago });
}

export async function countByTurnoId(turnoId) {
  return Reserva.count({ where: { turno_id: turnoId } });
}