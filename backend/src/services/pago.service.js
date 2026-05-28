import * as pagoRepository from '../repositories/pago.repository.js';

const TARJETA_RECHAZADA = '1111222233334444';

function normalizarNumeroTarjeta(numeroTarjeta) {
    return String(numeroTarjeta ?? '').replace(/\s/g, '');
}

export async function pago(tarjetaDebito) {
    const numeroTarjeta = normalizarNumeroTarjeta(tarjetaDebito?.numero);

    if (!numeroTarjeta) {
        throw new Error('Debe ingresar una tarjeta de debito');
    }

    if (numeroTarjeta === TARJETA_RECHAZADA) {
        return {
            exitoso: false,
            estado: 'RECHAZADO',
            mensaje: 'Error en el pago'
        };
    }

    return {
        exitoso: true,
        estado: 'COMPLETADO',
        mensaje: 'Pago exitoso'
    };
}

export async function registrarSena({ monto, reservaId, usuarioId }) {
    const montoNumerico = Number(monto);

    if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('Debe ingresar un monto valido para la sena');
    }

    return pagoRepository.create({
        monto,
        tipo_pago: 'SENA',
        metodo_pago: 'MERCADO_PAGO',
        estado: 'COMPLETADO',
        reserva_id: reservaId,
        usuario_id: usuarioId
    });
}
