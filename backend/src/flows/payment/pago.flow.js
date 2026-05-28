import * as pagoService from '../../services/pago.service.js';
import * as reservaService from '../../services/reserva.service.js';

export async function pagarSenaReserva({ reservaId, tarjetaDebito, monto }) {

    const reserva = await reservaService.findById(reservaId);

    if (!reserva) {
        throw new Error('Reserva no encontrada');
    }

    if (reserva.estado === 'CANCELADA') {
        throw new Error('La reserva ha sido cancelada y no puede ser pagada');
    }

    if (reserva.estado_pago !== 'PENDIENTE') {
        throw new Error('La reserva no está pendiente de pago');
    }

    const resultadoPago = await pagoService.pago(tarjetaDebito);

    if (!resultadoPago.exitoso) {
        return resultadoPago;
    }

    const pago = await pagoService.registrarSena({
        monto,
        reservaId,
        usuarioId: reserva.usuario_id
    });

    const reservaActualizada = await reservaService.actualizarEstadoPago(reservaId, 'SENA_ABONADA');

    return {
        ...resultadoPago,
        pago,
        reserva: reservaActualizada
    };
}
