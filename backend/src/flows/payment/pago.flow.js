import * as pagoService from '../../services/pago.service.js';
import * as reservaService from '../../services/reserva.service.js';
import * as turnoService from '../../services/turno.service.js';
import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as listaEsperaNoAbonadoService from '../../services/listaEsperaNoAbonado.service.js';
import * as notificacionService from '../../services/notificacion.service.js';
import { getRemainingClassesInSportifyMonth, getAllClassesInSportifyMonth } from '../../utils/date.utils.js';
import { validarPuedeAbonarse } from '../../utils/abonado.validator.js';
import { sequelize } from '../../config/database.js';

const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

function obtenerFechasDelMes(diaSemana, fechaBase = new Date()) {
    const indexDia = DIAS_SEMANA.indexOf(String(diaSemana ?? '').trim().toUpperCase());

    if (indexDia < 0) {
        return [];
    }

    const hoy = new Date(fechaBase);
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const fechas = [];

    const diferenciaInicial = (indexDia - inicio.getDay() + 7) % 7;
    const primeraFecha = new Date(inicio);
    primeraFecha.setDate(inicio.getDate() + diferenciaInicial);

    for (let fecha = primeraFecha; fecha <= fin; fecha.setDate(fecha.getDate() + 7)) {
        fechas.push(fecha.toISOString().split('T')[0]);
    }

    return fechas;
}

function normalizarFechaHora(fecha, horaInicio) {
    if (!fecha || !horaInicio) {
        return null;
    }

    const fechaHora = new Date(`${fecha}T${horaInicio}`);
    return Number.isNaN(fechaHora.getTime()) ? null : fechaHora;
}

function obtenerProximaFechaClase(diaSemana, horaInicio, fechaBase = new Date()) {
    const indexDia = DIAS_SEMANA.indexOf(String(diaSemana ?? '').trim().toUpperCase());

    if (indexDia < 0) {
        return null;
    }

    const ahora = new Date(fechaBase);
    const diaActual = new Date(ahora);
    diaActual.setHours(0, 0, 0, 0);

    let diasHastaClase = (indexDia - diaActual.getDay() + 7) % 7;
    const claseHoy = normalizarFechaHora(
        diaActual.toISOString().split('T')[0],
        horaInicio
    );

    if (diasHastaClase === 0 && claseHoy && ahora >= claseHoy) {
        diasHastaClase = 7;
    }

    const proximaClase = new Date(diaActual);
    proximaClase.setDate(diaActual.getDate() + diasHastaClase);
    return proximaClase;
}

async function contarClasesReservablesDelMes(turno, fechasDelMes, fechaCorte = new Date()) {
    const abonadosActivos = await abonadoTurnoService.findActivosByTurno(turno.id);

    const reservasPorFecha = await Promise.all(
        fechasDelMes.map((fecha) => reservaService.findByTurnoFecha(turno.id, fecha))
    );

    return fechasDelMes.reduce((contador, fecha, index) => {
        const fechaHoraClase = normalizarFechaHora(fecha, turno.hora_inicio);

        if (!fechaHoraClase || fechaHoraClase <= fechaCorte) {
            return contador;
        }

        const cuposDisponibles = calcularCuposDisponiblesFecha(
            turno,
            abonadosActivos,
            reservasPorFecha[index] || []
        );

        return cuposDisponibles > 0 ? contador + 1 : contador;
    }, 0);
}

async function usuarioTieneSuspension(usuarioId) {
    const abonadosSuspendidos = await abonadoTurnoService.findSuspendedByUsuarioId(usuarioId);
    return (abonadosSuspendidos?.length || 0) > 0;
}

function calcularMontoSena(reserva) {
    const precioClase = Number(reserva?.Turno?.Actividad?.precio_clase);

    if (!precioClase || Number.isNaN(precioClase)) {
        throw new Error('No se pudo calcular el monto de la sena');
    }

    return precioClase * 0.5;
}

async function calcularMontoAbonoMensual(turnoId, usuarioId, fechaBase = new Date()) {
    const turno = await turnoService.getTurnoById(turnoId);
    const precioMensual = Number(turno?.Actividad?.precio_mensual);

    if (!precioMensual || Number.isNaN(precioMensual)) {
        throw new Error('No se pudo calcular el monto del abono mensual');
    }

    let allDates = getAllClassesInSportifyMonth(turno.dia_semana, fechaBase);
    let remainingDatesRaw = getRemainingClassesInSportifyMonth(turno.dia_semana, fechaBase);

    // Si no quedan clases en el mes actual, se calcula para el mes siguiente (alineado con la validación de abono)
    if (remainingDatesRaw.length === 0) {
        const ref = new Date(fechaBase);
        const day = ref.getDate();
        let nextCycleDate = new Date(ref);
        if (day >= 11) {
            nextCycleDate.setMonth(nextCycleDate.getMonth() + 1);
            nextCycleDate.setDate(15);
        } else {
            nextCycleDate.setDate(15);
        }
        allDates = getAllClassesInSportifyMonth(turno.dia_semana, nextCycleDate);
        remainingDatesRaw = getRemainingClassesInSportifyMonth(turno.dia_semana, nextCycleDate);
    }

    const ahora = new Date();
    const remainingDates = remainingDatesRaw.filter(fecha => {
        const [year, month, day] = fecha.split('-');
        const [hora, min] = turno.hora_inicio.split(':');
        const fechaClase = new Date(year, month - 1, day, hora, min);
        return fechaClase >= ahora;
    });

    const clasesDelMes = allDates.length;
    const clasesRestantes = remainingDates.length;
    const clasesTranscurridas = clasesDelMes - clasesRestantes;

    const sinDescuento = await usuarioTieneSuspension(usuarioId);
    const montoBaseMes = sinDescuento ? precioMensual : precioMensual * 0.8;
    const costoPorClase = montoBaseMes / clasesDelMes;

    const montoCalculado = montoBaseMes - (costoPorClase * clasesTranscurridas);

    return Math.max(0, Number(montoCalculado.toFixed(2)));
}

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

export async function obtenerMontoSenaReservaCliente({ reservaId }, usuarioId) {
    const reserva = await reservaService.findById(reservaId);

    if (String(reserva.usuario_id) !== String(usuarioId)) {
        throw new Error('No puedes consultar el monto de una reserva de otro cliente');
    }

    validarReservaPagable(reserva);

    return {
        monto: calcularMontoSena(reserva)
    };
}

export async function obtenerMontoSenaTurnoCliente({ turnoId }) {
    const turno = await turnoService.getTurnoById(turnoId);
    const precioClase = Number(turno?.Actividad?.precio_clase);

    if (!precioClase || Number.isNaN(precioClase)) {
        throw new Error('No se pudo calcular el monto de la sena');
    }

    return {
        monto: precioClase * 0.5
    };
}

export async function obtenerMontoSuscripcionMensualCliente({ turnoId, fecha }, usuarioId) {
    const validacion = await validarPuedeAbonarse(usuarioId, turnoId, fecha);
    if (!validacion.puede) {
        throw new Error(validacion.motivo);
    }
    return {
        monto: await calcularMontoAbonoMensual(turnoId, usuarioId, fecha)
    };
}

export async function pagarSenaReserva({ reservaId, tarjetaDebito }) {
    const reserva = await reservaService.findById(reservaId);

    validarReservaPagable(reserva);
    const montoSena = calcularMontoSena(reserva);

    const resultadoPago = await pagoService.pago(tarjetaDebito);

    if (!resultadoPago.exitoso) {
        return resultadoPago;
    }

    const reservaActualizada = await reservaService.actualizarEstadoPagoSiPendiente(reservaId, 'SENA_ABONADA');

    const pago = await pagoService.registrarSena({
        monto: montoSena,
        reservaId,
        usuarioId: reserva.usuario_id
    });

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

    const reservaActualizada = await reservaService.actualizarEstadoPagoSiPendiente(reservaId, 'SENA_ABONADA');

    const pago = await pagoService.registrarSena({
        monto: montoSena,
        reservaId,
        usuarioId: reserva.usuario_id,
        metodoPago: 'EFECTIVO',
        empleadoId
    });

    return {
        exitoso: true,
        estado: 'COMPLETADO',
        mensaje: 'Sena presencial registrada correctamente',
        pago,
        reserva: reservaActualizada
    };
}

export async function pagarSuscripcionMensualCliente({ turnoId, tarjetaDebito, fecha }, usuarioId) {
    const validacion = await validarPuedeAbonarse(usuarioId, turnoId, fecha);
    if (!validacion.puede) {
        throw new Error(validacion.motivo);
    }

    const montoNumerico = await calcularMontoAbonoMensual(turnoId, usuarioId, fecha);

    const resultadoPago = await pagoService.pago(tarjetaDebito);

    if (!resultadoPago.exitoso) {
        return resultadoPago;
    }

    const pago = await pagoService.registrarSuscripcionMensual({
        monto: montoNumerico,
        usuarioId
    });

    return {
        ...resultadoPago,
        pago
    };
}

export async function pagarSuscripcionPendienteCliente({ pagoId, tarjetaDebito }, usuarioId) {
    const pagoPendiente = await pagoService.findById(pagoId);

    if (!pagoPendiente) {
        throw new Error('Pago no encontrado');
    }

    if (String(pagoPendiente.usuario_id) !== String(usuarioId)) {
        throw new Error('No puedes pagar una suscripción de otro cliente');
    }

    if (pagoPendiente.estado !== 'PENDIENTE' || pagoPendiente.tipo_pago !== 'SUSCRIPCION_MENSUAL') {
        throw new Error('El pago no es una suscripción pendiente válida');
    }

    if (!pagoPendiente.abonado_turno_id) {
        throw new Error('El pago no tiene una suscripción original asociada');
    }

    const abonoActual = await abonadoTurnoService.findById(pagoPendiente.abonado_turno_id);
    if (!abonoActual) {
        throw new Error('La suscripción original no existe');
    }

    // Determinar la fecha base de validación y la acción dependiendo del estado del abono original
    const hoy = new Date();
    let fechaBaseValidacion;
    
    if (abonoActual.estado === 'ACTIVO') {
        // Renovación temprana: Se valida y paga para el mes SIGUIENTE
        fechaBaseValidacion = new Date(hoy);
        if (hoy.getDate() >= 11) {
            fechaBaseValidacion.setMonth(fechaBaseValidacion.getMonth() + 1);
            fechaBaseValidacion.setDate(11);
        } else {
            fechaBaseValidacion.setDate(11);
        }
    } else if (abonoActual.estado === 'SUSPENDIDO') {
        // Pago tardío: Se valida y paga para el mes ACTUAL
        fechaBaseValidacion = new Date(hoy);
    } else {
        throw new Error('El estado del abono no permite renovación o reactivación');
    }

    // Validar si el usuario puede abonarse para el mes evaluado
    const validacion = await validarPuedeAbonarse(usuarioId, abonoActual.turno_id, fechaBaseValidacion);
    if (!validacion.puede) {
        throw new Error(validacion.motivo);
    }
    const turnoAbono = await turnoService.getTurnoById(abonoActual.turno_id);

    // Cobrar la tarjeta
    const resultadoPago = await pagoService.pago(tarjetaDebito);

    if (!resultadoPago.exitoso) {
        return resultadoPago;
    }

    const transaction = await sequelize.transaction();
    const colasNoAbonadoRechazadas = [];
    const fechasAbonoConfirmadas = [];

    try {
        let abonoIdParaPago = abonoActual.id;

        if (abonoActual.estado === 'ACTIVO') {
            const mesAnioActual = abonoActual.mes_anio;
            const nuevoMesAnio = (mesAnioActual % 12) + 1;

            // Crear la nueva suscripción para el mes siguiente
            const nuevoAbono = await abonadoTurnoService.create({
                usuario_id: pagoPendiente.usuario_id,
                turno_id: abonoActual.turno_id,
                mes_anio: nuevoMesAnio,
                fecha_alta: new Date(),
                estado: 'ACTIVO',
                cancelaciones_mes: 0,
                pierde_descuento: false
            }, { transaction });
            abonoIdParaPago = nuevoAbono.id;
        } else if (abonoActual.estado === 'SUSPENDIDO') {
            // Actualizar el abono suspendido a activo
            await abonadoTurnoService.updateEstado(abonoActual.id, 'ACTIVO', transaction);
        }

        // Generar las reservas correspondientes
        let reservasCreadas = 0;
        for (const fecha of validacion.remainingDates) {
            const reservaExistente = await reservaService.findByUsuarioTurnoFecha(usuarioId, abonoActual.turno_id, fecha);
            if (!reservaExistente || reservaExistente.estado !== 'CONFIRMADA') {
                await reservaService.create({
                    usuario_id: usuarioId,
                    turno_id: abonoActual.turno_id,
                    fecha: fecha,
                    tipo_reserva: 'ABONADO',
                    estado: 'CONFIRMADA',
                    estado_pago: 'PAGADO_COMPLETO'
                }, { transaction });
                reservasCreadas++;
            }

            fechasAbonoConfirmadas.push(fecha);
        }

        // Actualizar el pago a COMPLETADO y reasignar el abonado_turno_id
        await pagoService.updatePago(pagoPendiente.id, {
            estado: 'COMPLETADO',
            abonado_turno_id: abonoIdParaPago
        }, { transaction });

        await transaction.commit();

        try {
            for (const fecha of fechasAbonoConfirmadas) {
                const rechazadas = await listaEsperaNoAbonadoService.rechazarSuperpuestasByUsuarioFechaHora(
                    usuarioId,
                    fecha,
                    turnoAbono.hora_inicio
                );
                colasNoAbonadoRechazadas.push(...rechazadas);
            }

            if (colasNoAbonadoRechazadas.length > 0) {
                await notificacionService.create({
                    usuario_id: usuarioId,
                    mensaje: `Al confirmarse tu abono, saliste de ${colasNoAbonadoRechazadas.length} lista(s) de espera de no abonados porque correspondían a la misma fecha y horario.`,
                    leida: false,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error('No se pudieron limpiar o notificar las colas superpuestas al abono:', error);
        }

        return {
            ...resultadoPago,
            mensaje: `Suscripción ${abonoActual.estado === 'ACTIVO' ? 'renovada' : 'reactivada'} y pago completado con éxito. Se crearon ${reservasCreadas} reservas.`,
            nuevoAbonoId: abonoIdParaPago,
            reservasCreadas
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
