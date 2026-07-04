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

export async function registrarSena({
    monto,
    reservaId,
    usuarioId,
    metodoPago = 'MERCADO_PAGO',
    empleadoId = null
}) {
    const montoNumerico = Number(monto);

    if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('Debe ingresar un monto valido para la sena');
    }

    return pagoRepository.create({
        monto,
        tipo_pago: 'SENA',
        metodo_pago: metodoPago,
        estado: 'COMPLETADO',
        reserva_id: reservaId,
        usuario_id: usuarioId,
        registrado_por_empleado_id: empleadoId
    });
}

export async function registrarSuscripcionMensual({
    monto,
    usuarioId,
    metodoPago = 'MERCADO_PAGO'
}) {
    const montoNumerico = Number(monto);

    if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('Debe ingresar un monto valido para la suscripcion mensual');
    }

    return pagoRepository.create({
        monto,
        tipo_pago: 'SUSCRIPCION_MENSUAL',
        metodo_pago: metodoPago,
        estado: 'COMPLETADO',
        usuario_id: usuarioId
    });
}

export async function findByUsuarioId(usuarioId) {
    return pagoRepository.findByUsuarioId(usuarioId);
}

export async function deleteByUsuarioId(usuarioId, transaction) {
    return pagoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export async function findSenaCompletadaByReserva(reservaId) {
    return pagoRepository.findSenaCompletadaByReserva(reservaId);
}

export async function crearDevolucionSena(reservaId, usuarioId, monto) {
    return pagoRepository.create({
        monto,
        tipo_pago: 'DEVOLUCION_SENA',
        estado: 'PENDIENTE',
        reserva_id: reservaId,
        usuario_id: usuarioId
    });
}


export async function listarDeudores() {
  const pagosPendientes = await pagoRepository.getPagosPendientes();

  return pagosPendientes.map(pago => {
    const esAbono = pago.tipo_pago === 'SUSCRIPCION_MENSUAL';
    
    // Determinamos de dónde sacar la información de la clase según el tipo de deuda
    let detalleActividad = 'Actividad no especificada';
    let detalleHorario = '';

    if (esAbono && pago.AbonadoTurno) {
      detalleActividad = pago.AbonadoTurno.Turno.Actividad.nombre;
      detalleHorario = `${pago.AbonadoTurno.Turno.dia_semana} ${pago.AbonadoTurno.Turno.hora_inicio}`;
    } else if (!esAbono && pago.Reserva) {
      detalleActividad = pago.Reserva.Turno.Actividad.nombre;
      detalleHorario = `${pago.Reserva.Turno.dia_semana} ${pago.Reserva.Turno.hora_inicio}`;
    }

    return {
      pago_id: pago.id,
      monto_adeudado: Number(pago.monto),
      concepto: pago.tipo_pago, // Ej: 'SUSCRIPCION_MENSUAL', 'RESTO_TURNO', etc.
      fecha_emision_deuda: pago.createdAt,
      clase: {
        actividad: detalleActividad,
        horario: detalleHorario
      },
      usuario: {
        id: pago.Usuario.id,
        nombre: `${pago.Usuario.nombre} ${pago.Usuario.apellido}`,
        dni: pago.Usuario.dni,
        email: pago.Usuario.email
      }
    };
  });
}