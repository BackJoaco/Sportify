import * as pagoService from '../../services/pago.service.js';
import * as reservaService from '../../services/reserva.service.js';

function validarReservaPagable(reserva) {
    if (!reserva) {
        throw new Error('Reserva no encontrada');
    }

    if (reserva.estado === 'CANCELADA') {
        throw new Error('La reserva ha sido cancelada y no puede ser pagada');
    }

    if (reserva.estado_pago !== 'PENDIENTE') {
        throw new Error('La reserva no esta pendiente de pago');
    }
}

function calcularMontoSena(reserva) {
    const precioClase = Number(reserva?.Turno?.Actividad?.precio_clase);

    if (!precioClase || Number.isNaN(precioClase)) {
        throw new Error('No se pudo calcular el monto de la sena');
    }

    return precioClase * 0.5;
}

export async function pagarSenaReserva({ reservaId, tarjetaDebito }) {
    const reserva = await reservaService.findById(reservaId);

    validarReservaPagable(reserva);
    const montoSena = calcularMontoSena(reserva);

    const resultadoPago = await pagoService.pago(tarjetaDebito);

    if (!resultadoPago.exitoso) {
        return resultadoPago;
    }

    const pago = await pagoService.registrarSena({
        monto: montoSena,
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

export async function pagarSenaReservaCliente({ reservaId, tarjetaDebito }, usuarioId) {
    const reserva = await reservaService.findById(reservaId);

    if (String(reserva.usuario_id) !== String(usuarioId)) {
        throw new Error('No puedes pagar una reserva de otro cliente');
    }

    return pagarSenaReserva({ reservaId, tarjetaDebito });
}

export async function pagarSenaPresencial({ reservaId }, empleadoId) {
    const reserva = await reservaService.findById(reservaId);

    validarReservaPagable(reserva);
    const montoSena = calcularMontoSena(reserva);

    const pago = await pagoService.registrarSena({
        monto: montoSena,
        reservaId,
        usuarioId: reserva.usuario_id,
        metodoPago: 'EFECTIVO',
        empleadoId
    });

    const reservaActualizada = await reservaService.actualizarEstadoPago(reservaId, 'SENA_ABONADA');

    return {
        exitoso: true,
        estado: 'COMPLETADO',
        mensaje: 'Sena presencial registrada correctamente',
        pago,
        reserva: reservaActualizada
    };
}
