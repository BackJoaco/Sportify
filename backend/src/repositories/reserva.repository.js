import { Reserva } from '../models/index.model.js';

export async function findById(id) {
    return Reserva.findByPk(id);
}

export async function updateEstadoPago(id, estadoPago) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
        return null;
    }

    return reserva.update({ estado_pago: estadoPago });
}
