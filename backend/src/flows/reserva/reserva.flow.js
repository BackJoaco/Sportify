import * as turnoService from '../../services/turno.service.js';
import * as usuarioService from '../../services/usuario.service.js';
import * as reservaService from '../../services/reserva.service.js';
import crypto from 'crypto';

export async function create(usuario_id, turno_id) {
  // 1. Verificar que el Turno exista
  const turno = await turnoService.getTurnoById(turno_id);
  if (!turno) {
    throw new Error('El turno especificado no existe.');
  }

  // 2. Verificar que el Usuario exista
  const usuario = await usuarioService.getProfile(usuario_id);
  if (!usuario) {
    throw new Error('El usuario especificado no existe.');
  }

  // 3. Verificar que el horario del turno sea en el futuro
  const fechaHoraTurno = new Date(`${turno.fecha}T${turno.hora_inicio}`);
  const ahora = new Date();
  
  if (ahora >= fechaHoraTurno) {
    throw new Error('No se puede reservar un turno que ya comenzó o ya pasó.');
  }

  // 4. Verificar cupo disponible
  const cantidadReservas = await reservaService.countByTurno(turno_id);
  if (cantidadReservas >= turno.cupo_maximo) {
    throw new Error('El turno ya no tiene cupos disponibles.');
  }

  // 5. Verificar superposición de horarios (y que no reserve el mismo turno 2 veces)
  const reservasDelDia = await reservaService.findActivasByUsuarioAndFecha(usuario_id, turno.fecha);
  
  const superposicion = reservasDelDia.find(reserva => 
    reserva.Turno.hora_inicio === turno.hora_inicio
  );

  if (superposicion) {
    if (superposicion.turno_id === turno_id) {
      throw new Error('Ya tienes una reserva confirmada para esta clase.');
    }
    throw new Error('Ya tienes otra actividad reservada en este mismo horario.');
  }

  // 6. Generar el código QR único (ideal para validar ingresos)
  const uuid = crypto.randomUUID();
  const codigo_qr = `QR-U${usuario_id}-T${turno_id}-${uuid}`;

  // 7. Armar el payload final y crear la reserva
  const nuevaReservaPayload = {
    usuario_id,
    turno_id,
    tipo_reserva: 'NO_ABONADO', 
    codigo_qr
  };

  const nuevaReserva = await reservaService.create(nuevaReservaPayload);
  return nuevaReserva;
}

export async function cancelarReserva(reservaId) {
  const reserva = await reservaService.findById(reservaId);

  if (reserva.estado === 'CANCELADA') {
    throw new Error("La reserva ya se encuentra cancelada.");
  }

  // Usamos el servicio de turnos que ya tenías creado
  const turno = await turnoService.getTurnoById(reserva.turno_id);

  const fechaTurno = new Date(`${turno.fecha}T${turno.hora_inicio}`);
  const ahora = new Date();

  const diferenciaMs = fechaTurno - ahora;
  const horasFaltantes = diferenciaMs / (1000 * 60 * 60);

  if (horasFaltantes <= 0) {
    throw new Error("No se puede cancelar un turno que ya ha comenzado o finalizado.");
  }

  await reservaService.marcarComoCancelada(reservaId);

  if (reserva.estado_pago === 'PENDIENTE') {
    return {
      message: "Reserva cancelada exitosamente.",
      devuelveSena: false,
      teniaSenaAbonada: false
    };
  }

  const devuelveSena = horasFaltantes > 24;
  const mensajeSena = devuelveSena 
    ? "Se ha devuelto la seña ya que faltan más de 24 horas." 
    : "No se devuelve la seña porque faltan menos de 24 horas para el turno.";

  return {
    message: `Reserva cancelada exitosamente. ${mensajeSena}`,
    devuelveSena,
    teniaSenaAbonada: true
  };
}
