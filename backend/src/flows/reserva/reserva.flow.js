import crypto from 'crypto';
import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as listaEsperaAbonadoService from '../../services/listaEsperaAbonado.service.js';
import * as listaEsperaNoAbonadoService from '../../services/listaEsperaNoAbonado.service.js';
import { pagarSenaReserva } from '../payment/pago.flow.js';
import * as reservaService from '../../services/reserva.service.js';
import * as turnoService from '../../services/turno.service.js';
import * as usuarioService from '../../services/usuario.service.js';
import * as notificacionService from '../../services/notificacion.service.js';
import * as pagoService from '../../services/pago.service.js';
import * as creditoService from '../../services/credito.service.js';
import { validarPuedeAbonarse } from '../../utils/abonado.validator.js';

const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const MINUTOS_PAGO_SENA_LISTA_ESPERA = 1;

function obtenerDiaSemana(fecha) {
  const [year, month, day] = String(fecha).split('-').map(Number);
  return DIAS[new Date(year, month - 1, day).getDay()];
}

function obtenerFechaHora(fecha, horaInicio) {
  return new Date(`${fecha}T${horaInicio}`);
}

function validarFechaTurno(turno, fecha) {
  if (!fecha) {
    throw new Error('El campo fecha es obligatorio para reservar una clase.');
  }

  if (obtenerDiaSemana(fecha) !== turno.dia_semana) {
    throw new Error(`La fecha seleccionada no corresponde al dia del turno (${turno.dia_semana}).`);
  }

  if (obtenerFechaHora(fecha, turno.hora_inicio) <= new Date()) {
    throw new Error('No se puede operar sobre una clase que ya comenzo o ya paso.');
  }
}


export async function asignarSiguienteWaitlist(turnoId, fecha, checkNoAbonado = true) {
  let siguiente = null;
  let esAbonado = false;

  // 1. Verificar cola de abonados primero
  const listaAbonados = await listaEsperaAbonadoService.findByTurno(turnoId);
  const abonadosEnEspera = listaAbonados.filter(item => item.estado === 'EN_ESPERA');

  for (const abonadoEspera of abonadosEnEspera) {
    const validacion = await validarPuedeAbonarse(abonadoEspera.usuario_id, turnoId, fecha);

    if (validacion.puede) {
      siguiente = abonadoEspera;
      esAbonado = true;
      break;
    } else if (validacion.errorGlobal) {
      // Si el cupo está lleno de abonados fijos, nadie en la cola de abonados podrá entrar.
      break;
    }
  }

  if (!siguiente && checkNoAbonado) {
    siguiente = await listaEsperaNoAbonadoService.findSiguienteEnEspera(turnoId, fecha);
    esAbonado = false;
  }

  if (!siguiente) {
    return null;
  }

  if (esAbonado) {
    await listaEsperaAbonadoService.notificar(siguiente.id, 1);
  } else {
    await listaEsperaNoAbonadoService.notificar(siguiente.id, 1);
  }

  await notificacionService.create({
    usuario_id: siguiente.usuario_id,
    mensaje: 'Se liberó un cupo en el turno al que estabas inscripto en lista de espera. Tienes exactamente 1 hora para confirmar tu reserva.',
    leida: false,
    createdAt: new Date()
  });


  return {
    ...(siguiente.toJSON ? siguiente.toJSON() : siguiente),
    esAbonado
  };
}

export async function asignarCupoASiguienteNoAbonado(turnoId, fecha) {
  const siguiente = await listaEsperaNoAbonadoService.findSiguienteEnEspera(turnoId, fecha);

  if (!siguiente) {
    return null;
  }

  const uuid = crypto.randomUUID();
  const nuevaReserva = await reservaService.create({
    usuario_id: siguiente.usuario_id,
    turno_id: turnoId,
    fecha,
    tipo_reserva: 'NO_ABONADO',
    codigo_qr: `QR-U${siguiente.usuario_id}-T${turnoId}-F${fecha}-${uuid}`
  });

  await listaEsperaNoAbonadoService.confirmar(siguiente.id);

  await notificacionService.create({
    usuario_id: siguiente.usuario_id,
    mensaje: `Se libero un cupo en la clase a la que estabas inscripto en lista de espera. El lugar fue asignado automaticamente a tu nombre. Tenes ${MINUTOS_PAGO_SENA_LISTA_ESPERA} minutos para pagar la sena.`,
    leida: false,
    createdAt: new Date()
  });

  return {
    ...(siguiente.toJSON ? siguiente.toJSON() : siguiente),
    esAbonado: false,
    reserva: nuevaReserva
  };
}

export async function procesarReservasAsignadasSinSenaVencidas(fechaBase = new Date()) {
  const fechaLimite = new Date(fechaBase);
  fechaLimite.setMinutes(fechaLimite.getMinutes() - MINUTOS_PAGO_SENA_LISTA_ESPERA);

  const reservasVencidas = await reservaService.findPendientesNoAbonadoBefore(fechaLimite);
  let reservasCanceladas = 0;
  let cuposReasignados = 0;

  for (const reserva of reservasVencidas) {
    const esperaConfirmada = await listaEsperaNoAbonadoService.findConfirmada(
      reserva.usuario_id,
      reserva.turno_id,
      reserva.fecha
    );

    if (!esperaConfirmada) {
      continue;
    }

    const filasCanceladas = await reservaService.cancelarPendientePorVencimiento(reserva.id);
    if (filasCanceladas === 0) {
      continue;
    }

    await listaEsperaNoAbonadoService.expirar(esperaConfirmada.id);
    reservasCanceladas++;

    await notificacionService.create({
      usuario_id: reserva.usuario_id,
      mensaje: `Tu cupo asignado desde la lista de espera fue cancelado porque no registraste la sena dentro de los ${MINUTOS_PAGO_SENA_LISTA_ESPERA} minutos.`,
      leida: false,
      createdAt: new Date()
    });

    const turno = reserva.Turno || await turnoService.getTurnoById(reserva.turno_id);
    if (obtenerFechaHora(reserva.fecha, turno.hora_inicio) <= fechaBase) {
      continue;
    }

    const siguiente = await asignarCupoASiguienteNoAbonado(reserva.turno_id, reserva.fecha);
    if (siguiente) {
      cuposReasignados++;
    }
  }

  return {
    reservasCanceladas,
    cuposReasignados
  };
}

export async function create(usuario_id, turno_id, fecha) {
  const turno = await turnoService.getTurnoById(turno_id);
  const usuario = await usuarioService.getProfile(usuario_id);

  if (usuario.rol !== 'CLIENTE') {
    throw new Error('Solo se puede reservar un turno para un cliente.');
  }

  validarFechaTurno(turno, fecha);

  const abonadoActivo = await abonadoTurnoService.findActivo(usuario_id, turno_id);
  if (abonadoActivo) {
    throw new Error('Ya sos abonado de este turno. No hace falta reservarlo como no abonado.');
  }

  const abonadoSuspendido = await abonadoTurnoService.findSuspendido(usuario_id, turno_id);
  if (abonadoSuspendido) {
    throw new Error('Ya sos abonado de este turno. Regulariza tu suspension al abono para poder reservar esta clase.');
  }

  const reservaExistente = await reservaService.findByUsuarioTurnoFecha(usuario_id, turno_id, fecha);
  if (reservaExistente && reservaExistente.estado !== 'CANCELADA') {
    throw new Error('Ya tienes una reserva o asistencia registrada para esta clase.');
  }

  const reservasDelDia = await reservaService.findActivasByUsuarioAndFecha(usuario_id, fecha);
  const superposicion = reservasDelDia.find(reserva =>
    reserva.Turno.hora_inicio === turno.hora_inicio
  );

  if (superposicion) {
    throw new Error('Ya tienes otra actividad reservada en este mismo horario.');
  }

  const count = await reservaService.countByTurnoAndFecha(turno_id, fecha);
  if (count >= turno.cupo_maximo) {
    throw new Error('La clase ya alcanzó el cupo máximo. No hay cupo puntual disponible, por favor inscríbete a la lista de espera.');
  }

  const uuid = crypto.randomUUID();
  const codigo_qr = `QR-U${usuario_id}-T${turno_id}-F${fecha}-${uuid}`;

  const nuevaReserva = await reservaService.create({
    usuario_id,
    turno_id,
    fecha,
    tipo_reserva: 'NO_ABONADO',
    codigo_qr
  });

  const espera = await listaEsperaNoAbonadoService.findActiva(usuario_id, turno_id, fecha);
  if (espera) {
    await listaEsperaNoAbonadoService.confirmar(espera.id);
  }

  return {
    enEspera: false,
    message: 'Reserva creada con exito.',
    data: nuevaReserva
  };
}

export async function createConSena(usuario_id, turno_id, fecha, tarjetaDebito) {
  const resultadoReserva = await create(usuario_id, turno_id, fecha);

  if (resultadoReserva.enEspera) {
    return resultadoReserva;
  }

  const reserva = resultadoReserva.data;
  let resultadoPago;

  try {
    resultadoPago = await pagarSenaReserva({
      reservaId: reserva.id,
      tarjetaDebito
    });
  } catch (error) {
    await reservaService.marcarComoCancelada(reserva.id);
    throw error;
  }

  if (!resultadoPago.exitoso) {
    await reservaService.marcarComoCancelada(reserva.id);

    throw new Error(
      resultadoPago.mensaje || 'No se pudo procesar el pago de la sena. El cupo no fue reservado.'
    );
  }

  return {
    ...resultadoReserva,
    message: 'Reserva creada con exito. Sena abonada correctamente.',
    pago: resultadoPago.pago,
    data: resultadoPago.reserva
  };
}

export async function createConCredito(usuario_id, turno_id, fecha) {
  const resultadoReserva = await create(usuario_id, turno_id, fecha);

  if (resultadoReserva.enEspera) {
    return resultadoReserva;
  }

  const reserva = resultadoReserva.data;
  const turno = await turnoService.getTurnoById(turno_id);

  try {
    await pagoService.procesarPagoConCredito({
      usuarioId: usuario_id,
      reservaId: reserva.id,
      montoClase: turno.Actividad.precio_clase,
      tipoPago: 'CLASE_COMPLETA'
    });
  } catch (error) {
    await reservaService.marcarComoCancelada(reserva.id);
    throw error;
  }

  return {
    ...resultadoReserva,
    message: 'Reserva confirmada. Pagada con crédito exitosamente.',
    data: reserva
  };
}

async function _procesarCancelacionAbonado(reserva, usuarioId, horasFaltantes) {
  let generaCredito = false;
  let mensajeExtra = '';

  const parts = reserva.fecha.split('-');
  const day = parseInt(parts[2], 10);
  const jsMonth = parseInt(parts[1], 10) - 1;
  const currentMonthInt = day < 11 ? (jsMonth === 0 ? 12 : jsMonth) : (jsMonth + 1);

  const abono = await abonadoTurnoService.findActivoByMes(usuarioId, reserva.turno_id, currentMonthInt);
  if (!abono) {
    throw new Error('No se encontró un abono activo para este turno y mes.');
  }

  if (abono.cancelaciones_mes >= 3) {
    throw new Error('Llegaste al límite de 3 cancelaciones permitidas para este mes.');
  }

  const nuevasCancelaciones = abono.cancelaciones_mes + 1;
  const nuevoEstado = nuevasCancelaciones >= 3 ? 'SUSPENDIDO' : 'ACTIVO';

  await abonadoTurnoService.updateCancelaciones(abono.id, nuevasCancelaciones, nuevoEstado);

  if (nuevoEstado === 'SUSPENDIDO') {
    await reservaService.cancelarReservasFuturasAbonadoByUsuarioTurno(usuarioId, reserva.turno_id);
    await abonadoTurnoService.quitarDescuento(abono.id);
    
    // Obtener precio mensual
    const turno = await turnoService.getTurnoById(reserva.turno_id);
    const precioMensual = Number(turno?.Actividad?.precio_mensual || 0);

    // Generar pago de suscripción mensual pendiente
    await pagoService.registrarSuscripcionMensualPendiente({
      monto: precioMensual,
      usuarioId,
      abonadoTurnoId: abono.id,
      metodoPago: 'MERCADO_PAGO'
    });

    mensajeExtra = ` Llegaste al límite de 3 cancelaciones. Tu abono ha sido suspendido y todas tus clases restantes del mes fueron canceladas.`;
  } else {
    mensajeExtra = ` (Llevas ${nuevasCancelaciones} de 3 cancelaciones permitidas en el mes).`;
  }

  if (horasFaltantes > 48) {
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    await creditoService.create({
      usuario_id: usuarioId,
      estado: 'DISPONIBLE',
      fecha_vencimiento: fechaVencimiento
    });
    generaCredito = true;
    mensajeExtra += ' Se generó un crédito válido por 30 días.';
  } else {
    mensajeExtra += ' Cancelada con menos de 48 hs de anticipación. No corresponde crédito.';
  }

  return { generaCredito, mensajeExtra, generaDevolucion: false };
}

async function _procesarCancelacionNoAbonado(reserva, usuarioId, horasFaltantes) {
  let generaDevolucion = false;
  let mensajeExtra = '';

  if (horasFaltantes > 24) {
    const sena = await pagoService.findSenaCompletadaByReserva(reserva.id);
    if (sena) {
      await pagoService.crearDevolucionSena(reserva.id, usuarioId, sena.monto);
      generaDevolucion = true;
      mensajeExtra = ' Se generó una devolución de tu seña.';
    } else {
      mensajeExtra = ' Cancelada con anticipación, pero no tenías una seña registrada.';
    }
  } else {
    mensajeExtra = ' Cancelada con menos de 24 hs de anticipación. No corresponde devolución.';
  }

  return { generaCredito: false, mensajeExtra, generaDevolucion };
}

export async function cancelarReserva(reservaId, usuarioId) {
  const reserva = await reservaService.findById(reservaId);

  if (String(reserva.usuario_id) !== String(usuarioId)) {
    throw new Error('No puedes cancelar una reserva de otro cliente.');
  }

  if (reserva.estado === 'CANCELADA') {
    throw new Error('La reserva ya se encuentra cancelada.');
  }

  const turno = await turnoService.getTurnoById(reserva.turno_id);
  const fechaTurno = obtenerFechaHora(reserva.fecha, turno.hora_inicio);
  const ahora = new Date();
  const horasFaltantes = (fechaTurno - ahora) / (1000 * 60 * 60);

  if (horasFaltantes <= 0) {
    throw new Error('No se puede cancelar una clase que ya ha comenzado o finalizado.');
  }

  let procesado = { generaDevolucion: false, generaCredito: false, mensajeExtra: '' };

  if (reserva.tipo_reserva === 'NO_ABONADO') {
    procesado = await _procesarCancelacionNoAbonado(reserva, usuarioId, horasFaltantes);
  } else if (reserva.tipo_reserva === 'ABONADO') {
    procesado = await _procesarCancelacionAbonado(reserva, usuarioId, horasFaltantes);
  }

  await reservaService.marcarComoCancelada(reservaId);

  const siguiente = await asignarCupoASiguienteNoAbonado(reserva.turno_id, reserva.fecha);

  return {
    message: `Reserva cancelada exitosamente.${procesado.mensajeExtra}${siguiente ? ' El cupo fue asignado al siguiente cliente en la lista de espera.' : ''}`,
    generaDevolucion: procesado.generaDevolucion,
    generaCredito: procesado.generaCredito,
    siguienteAsignado: siguiente || null
  };
}

export async function cancelarClaseAbonado(usuarioId, turnoId, fecha) {
  const turno = await turnoService.getTurnoById(turnoId);
  validarFechaTurno(turno, fecha);

  const abonado = await abonadoTurnoService.findActivo(usuarioId, turnoId);
  if (!abonado) {
    throw new Error('Solo un abonado activo puede cancelar una clase puntual de este turno.');
  }

  const existente = await reservaService.findByUsuarioTurnoFecha(usuarioId, turnoId, fecha);
  if (existente && existente.estado === 'CANCELADA') {
    throw new Error('Esta clase ya se encuentra cancelada.');
  }

  let reserva = existente;
  if (!reserva) {
    reserva = await reservaService.create({
      usuario_id: usuarioId,
      turno_id: turnoId,
      fecha,
      tipo_reserva: 'ABONADO',
      estado: 'CANCELADA',
      estado_pago: 'PAGADO_COMPLETO',
      codigo_qr: `QR-ABONADO-U${usuarioId}-T${turnoId}-F${fecha}-${crypto.randomUUID()}`
    });
  } else {
    await reservaService.marcarComoCancelada(reserva.id);
  }

  const siguiente = await asignarCupoASiguienteNoAbonado(turnoId, fecha);

  return {
    message: siguiente
      ? 'Clase cancelada. El cupo puntual fue asignado al siguiente no abonado en cola.'
      : 'Clase cancelada. No hay no abonados en cola para esta fecha.',
    data: reserva,
    siguienteAsignado: siguiente
  };
}

export async function salirDeColaNoAbonado(usuarioId, turnoId, fecha) {
  const turno = await turnoService.getTurnoById(turnoId);
  if (!turno) {
    throw new Error('El turno especificado no existe.');
  }

  const espera = await listaEsperaNoAbonadoService.findActiva(usuarioId, turnoId, fecha);
  if (!espera) {
    throw new Error('No estás en la cola de no abonados para esta clase.');
  }

  const posicionLiberada = espera.posicion;
  await listaEsperaNoAbonadoService.deleteById(espera.id);
  await listaEsperaNoAbonadoService.reordenarPosiciones(turnoId, fecha, posicionLiberada);

  return {
    message: 'Saliste de la cola de no abonados.'
  };
}

export async function ingresarColaNoAbonado(usuarioId, turnoId, fecha) {
  const turno = await turnoService.getTurnoById(turnoId);
  if (!turno) {
    throw new Error('El turno especificado no existe.');
  }

  validarFechaTurno(turno, fecha);

  const espera = await listaEsperaNoAbonadoService.findActiva(usuarioId, turnoId, fecha);
  if (espera) {
    throw new Error('Ya estás en la cola de no abonados para esta clase.');
  }

  const enListaEsperaAbonado = await listaEsperaAbonadoService.findActiva(usuarioId, turnoId);
  if (enListaEsperaAbonado) {
    throw new Error('Ya te encuentras en lista de espera de abonados, no puedes unirte a ambas colas a la vez.');
  }

  const reservaExistente = await reservaService.findByUsuarioTurnoFecha(usuarioId, turnoId, fecha);
  if (reservaExistente && reservaExistente.estado === 'CONFIRMADA') {
    throw new Error('Ya posees una reserva confirmada para esta clase.');
  }

  const today = new Date();
  const day = today.getDate();
  const jsMonth = today.getMonth();
  const currentMonthInt = day < 11 ? (jsMonth === 0 ? 12 : jsMonth) : (jsMonth + 1);

  const abonoActivo = await abonadoTurnoService.findActivoOSuspendidoByMes(usuarioId, turnoId, currentMonthInt);
  if (abonoActivo) {
    throw new Error('Ya eres abonado de este turno. No puedes ingresar a la cola de no abonados.');
  }

  const reservasConfirmadas = await reservaService.countByTurnoAndFecha(turnoId, fecha);
  if (reservasConfirmadas < turno.cupo_maximo) {
    throw new Error('Hay cupos disponibles, puedes reservar directamente.');
  }

  const result = await listaEsperaNoAbonadoService.agregar(usuarioId, turnoId, fecha);

  const cantidadEncoladosNoAbonados = await listaEsperaNoAbonadoService.countWaiting(turnoId, fecha);
  const cantidadEncoladosAbonados = await listaEsperaAbonadoService.countWaiting(turnoId);

  if ((cantidadEncoladosNoAbonados + cantidadEncoladosAbonados) === 10) {
    await notificacionService.notificarAltaDemanda(turnoId, fecha);
  }

  return {
    message: 'Ingresaste exitosamente a la cola de no abonados.',
    posicion: result.posicion
  };
}

export async function escanearQRFlow(codigo_qr) {
  // 1. Registrar el presente de la reserva del cliente
  const reservaActualizada = await reservaService.marcarPresentePorQR(codigo_qr);

  // 2. Si existe un pago de seña completada para esta reserva, cobrar el resto
  const senaPago = await pagoService.findSenaCompletadaByReserva(reservaActualizada.id);
  
  if (senaPago) {
    // Registrar el resto del turno con efectivo y estado completado
    await pagoService.registrarRestoTurno({
      monto: senaPago.monto,
      reservaId: reservaActualizada.id,
      usuarioId: reservaActualizada.usuario_id,
      metodoPago: 'EFECTIVO'
    });

    // Actualizar el estado de pago de la reserva a PAGADO_COMPLETO
    await reservaService.actualizarEstadoPago(reservaActualizada.id, 'PAGADO_COMPLETO');
  }

  // Retornar la reserva con el estado de pago y asistencia más reciente
  return reservaService.findById(reservaActualizada.id);
}
