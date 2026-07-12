import * as pagoRepository from '../repositories/pago.repository.js';
import * as creditoRepository from '../repositories/credito.repository.js';
import { sequelize } from '../config/database.js';
import { Pago, Reserva, Credito } from '../models/index.model.js';

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
    const pagos = await pagoRepository.findByUsuarioId(usuarioId);

    return pagos.map(pago => {
        const esAbono = pago.tipo_pago === 'SUSCRIPCION_MENSUAL';

        let detalleActividad = 'Sin especificar / General';
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
            monto: Number(pago.monto),
            concepto: pago.tipo_pago,
            metodo_pago: pago.metodo_pago,
            estado: pago.estado,
            fecha: pago.createdAt,
            clase: {
                actividad: detalleActividad,
                horario: detalleHorario
            }
        };
    });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
    return pagoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export async function findById(id) {
    return pagoRepository.findById(id);
}

export async function updatePago(id, data, options = {}) {
    return pagoRepository.updatePago(id, data, options);
}

export async function findSenaCompletadaByReserva(reservaId) {
    return pagoRepository.findSenaCompletadaByReserva(reservaId);
}

export async function crearDevolucionSena(reservaId, usuarioId, monto) {
    return pagoRepository.create({
        monto,
        tipo_pago: 'DEVOLUCION_SENA',
        estado: 'COMPLETADO',
        metodo_pago: 'MERCADO_PAGO',
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
export async function procesarPagoConCredito({ usuarioId, reservaId, montoClase, tipoPago }) {
  // 1. Barrera de seguridad: Bloquear uso en abonos mensuales
  if (tipoPago === 'SUSCRIPCION_MENSUAL') {
    throw new Error('Los créditos solo pueden utilizarse para cubrir clases individuales, no abonos mensuales.');
  }

  const transaction = await sequelize.transaction();

  try {
    // 2. Validar que el crédito le pertenezca y esté vigente
    const credito = await creditoRepository.getPrimerCreditoVigente(usuarioId, transaction);
    if (!credito) {
      throw new Error('No posees créditos válidos o vigentes.');
    }

    // 3. Cambiar el estado del crédito a USADO
    await credito.update({ estado: 'USADO' }, { transaction });

    // 4. Registrar el pago. El monto es el 100% del valor de la clase.
    const payloadPagoCredito = {
      monto: montoClase, 
      tipo_pago: 'CLASE_COMPLETA', // Refleja que pagó la clase entera con el crédito
      metodo_pago: 'CREDITO',
      estado: 'COMPLETADO',
      usuario_id: usuarioId,
      reserva_id: reservaId,
      abonado_turno_id: null // Refuerza que no aplica a suscripciones
    };

    await Pago.create(payloadPagoCredito, { transaction });

    // 5. Actualizar la reserva original para que el sistema sepa que ya está saldada
    await Reserva.update(
      { estado_pago: 'PAGADO_COMPLETO' },
      { 
        where: { id: reservaId, usuario_id: usuarioId },
        transaction 
      }
    );

    await transaction.commit();

    return {
      mensaje: 'Crédito aplicado exitosamente. La clase está 100% cubierta.',
      monto_restante_a_pagar: 0 // El frontend recibe esto y sabe que no debe cobrar nada más
    };

  } catch (error) {
    await transaction.rollback();
    console.error('Error al aplicar crédito:', error.message);
    throw error;
  }
}


export async function listarMovimientos() {
  const pagos = await pagoRepository.getTodosLosMovimientos();

  return pagos.map(pago => {
    const esAbono = pago.tipo_pago === 'SUSCRIPCION_MENSUAL';
    
    // Identificamos a qué clase pertenece el movimiento
    let detalleActividad = 'Sin especificar / General';
    let detalleHorario = '';

    if (esAbono && pago.AbonadoTurno) {
      detalleActividad = pago.AbonadoTurno.Turno.Actividad.nombre;
      detalleHorario = `${pago.AbonadoTurno.Turno.dia_semana} ${pago.AbonadoTurno.Turno.hora_inicio}`;
    } else if (!esAbono && pago.Reserva) {
      detalleActividad = pago.Reserva.Turno.Actividad.nombre;
      detalleHorario = `${pago.Reserva.Turno.dia_semana} ${pago.Reserva.Turno.hora_inicio}`;
    }

    return {
      movimiento_id: pago.id,
      monto: Number(pago.monto),
      tipo_movimiento: pago.tipo_pago, // Ej: SENA, DEVOLUCION_SENA, SUSCRIPCION_MENSUAL
      metodo_pago: pago.metodo_pago,   // Ej: MERCADO_PAGO, EFECTIVO, CREDITO
      estado_pago: pago.estado,        // Ej: COMPLETADO, PENDIENTE, RECHAZADO
      fecha_movimiento: pago.createdAt,
      detalle_clase: {
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

export async function registrarRestoTurno({
    monto,
    reservaId,
    usuarioId,
    metodoPago = 'EFECTIVO'
}) {
    const montoNumerico = Number(monto);

    if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('Debe ingresar un monto valido para el resto del turno');
    }

    return pagoRepository.create({
        monto,
        tipo_pago: 'RESTO_TURNO',
        metodo_pago: metodoPago,
        estado: 'COMPLETADO',
        reserva_id: reservaId,
        usuario_id: usuarioId
    });
}

export async function asociarPagoConAbono(usuarioId, abonadoTurnoId, options = {}) {
    return pagoRepository.asociarPagoConAbono(usuarioId, abonadoTurnoId, options);
}