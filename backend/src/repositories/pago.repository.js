import { Actividad, Pago, Reserva, Turno } from '../models/index.model.js';

export async function create(data) {
    return Pago.create(data);
}

export async function findByUsuarioId(usuarioId) {
    return Pago.findAll({
        where: { usuario_id: usuarioId },
        include: [
            {
                model: Reserva,
                include: [
                    {
                        model: Turno,
                        include: [Actividad]
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
    });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
    return Pago.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}

export async function findSenaCompletadaByReserva(reservaId) {
    return Pago.findOne({
        where: {
            reserva_id: reservaId,
            tipo_pago: 'SENA',
            estado: 'COMPLETADO'
        }
    });
}
