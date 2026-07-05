import * as pagoService from '../../services/pago.service.js';
import * as reservaService from '../../services/reserva.service.js';
import * as turnoService from '../../services/turno.service.js';
import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import { getRemainingClassesInSportifyMonth, getAllClassesInSportifyMonth } from '../../utils/date.utils.js';

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

    const allDates = getAllClassesInSportifyMonth(turno.dia_semana, fechaBase);
    const remainingDatesRaw = getRemainingClassesInSportifyMonth(turno.dia_semana, fechaBase);

    const ahora = new Date();
    const remainingDates = remainingDatesRaw.filter(fecha => {
        const [year, month, day] = fecha.split('-');
        const [hora, min] = turno.hora_inicio.split(':');
        const fechaClase = new Date(year, month - 1, day, hora, min);
        return fechaClase > ahora;
    });

    if (remainingDates.length <= 1) {
        throw new Error('No puedes abonarte porque es la última clase del mes o ya no quedan clases.');
    }

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

export async function pagarSuscripcionMensualCliente({ turnoId, tarjetaDebito, fecha }, usuarioId) {
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
