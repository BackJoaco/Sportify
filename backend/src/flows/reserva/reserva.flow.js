import crypto from 'crypto';
import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as listaEsperaNoAbonadoService from '../../services/listaEsperaNoAbonado.service.js';
import { pagarSenaReserva } from '../payment/pago.flow.js';
import * as reservaService from '../../services/reserva.service.js';
import * as turnoService from '../../services/turno.service.js';
import * as usuarioService from '../../services/usuario.service.js';
import { calcularCuposDisponiblesFecha } from '../../utils/ocupacionTurno.js';

const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

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

async function calcularCuposDisponibles(turno, fecha) {
  const abonadosActivos = await abonadoTurnoService.findActivosByTurno(turno.id);
  const reservasFecha = await reservaService.findByTurnoFecha(turno.id, fecha);

  return calcularCuposDisponiblesFecha(turno, abonadosActivos, reservasFecha);
}

async function reservarCupoParaSiguienteNoAbonado(turnoId, fecha) {
  const siguiente = await listaEsperaNoAbonadoService.findSiguienteEnEspera(turnoId, fecha);
  if (!siguiente) {
    return null;
  }

  await listaEsperaNoAbonadoService.reservarCupo(siguiente.id);
  return siguiente;
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

  const cuposDisponibles = await calcularCuposDisponibles(turno, fecha);
  if (cuposDisponibles <= 0) {
    const espera = await listaEsperaNoAbonadoService.agregar(usuario_id, turno_id, fecha);
    return {
      enEspera: true,
      message: 'No hay cupo puntual disponible. Te agregamos a la cola de no abonados.',
      data: espera
    };
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

  await reservaService.marcarComoCancelada(reservaId);

  const siguiente = await reservarCupoParaSiguienteNoAbonado(reserva.turno_id, reserva.fecha);

  if (reserva.tipo_reserva === 'ABONADO') {
    return {
      message: siguiente
        ? 'Clase cancelada. El cupo puntual fue reservado para el siguiente no abonado en cola.'
        : 'Clase cancelada. No hay no abonados en cola para esta fecha.',
      devuelveSena: false,
      teniaSenaAbonada: false,
      siguienteNotificado: siguiente
    };
  }

  if (reserva.estado_pago === 'PENDIENTE') {
    return {
      message: siguiente
        ? 'Reserva cancelada. No habia seña para devolver y se reservó el cupo para el siguiente en cola.'
        : 'Reserva cancelada. No habia seña para devolver.',
      devuelveSena: false,
      teniaSenaAbonada: false,
      siguienteNotificado: siguiente
    };
  }

  const devuelveSena = horasFaltantes > 24;
  const mensajeSena = devuelveSena
    ? 'Se ha devuelto la seña ya que faltan mas de 24 horas.'
    : 'No se devuelve la seña porque faltan menos de 24 horas para la clase.';

  return {
    message: siguiente
      ? `Reserva cancelada exitosamente. ${mensajeSena} Se reservó el cupo para el siguiente en cola.`
      : `Reserva cancelada exitosamente. ${mensajeSena}`,
    devuelveSena,
    teniaSenaAbonada: true,
    siguienteNotificado: siguiente
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

  const siguiente = await reservarCupoParaSiguienteNoAbonado(turnoId, fecha);

  return {
    message: siguiente
      ? 'Clase cancelada. El cupo puntual fue reservado para el siguiente no abonado en cola.'
      : 'Clase cancelada. No hay no abonados en cola para esta fecha.',
    data: reserva,
    siguienteNotificado: siguiente
  };
}
