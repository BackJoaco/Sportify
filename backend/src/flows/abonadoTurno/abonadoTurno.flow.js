import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as listaEsperaAbonadoService from '../../services/listaEsperaAbonado.service.js';
import * as reservaService from '../../services/reserva.service.js';
import * as turnoService from '../../services/turno.service.js';
import * as usuarioService from '../../services/usuario.service.js';

export async function altaAbonado(usuarioId, turnoId) {
  const usuario = await usuarioService.getProfile(usuarioId);
  const turno = await turnoService.getTurnoById(turnoId);

  if (usuario.rol !== 'CLIENTE') {
    throw new Error('Solo un cliente puede abonarse a un turno.');
  }

  const abonadoExistente = await abonadoTurnoService.findActivo(usuarioId, turnoId);
  if (abonadoExistente) {
    throw new Error('El cliente ya es abonado activo de este turno.');
  }

  const abonadosActivos = await abonadoTurnoService.countActivosByTurno(turnoId);
  if (abonadosActivos >= turno.cupo_maximo) {
    const espera = await listaEsperaAbonadoService.agregar(usuarioId, turnoId);
    return {
      status: 'EN_ESPERA',
      message: 'El turno no tiene cupos fijos disponibles. El cliente fue agregado a la cola de abonados.',
      data: espera
    };
  }

  const abonado = await abonadoTurnoService.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    estado: 'ACTIVO'
  });
  const reservasConvertidas = await reservaService.convertirReservasFuturasNoAbonadoAAbonado(
    usuarioId,
    turnoId
  );

  return {
    status: 'ACTIVO',
    message: reservasConvertidas > 0
      ? 'Cliente abonado al turno correctamente. Sus reservas futuras de este turno fueron asociadas al abono.'
      : 'Cliente abonado al turno correctamente.',
    data: abonado,
    reservasConvertidas
  };
}

export async function bajaAbonado(usuarioId, turnoId) {
  const abonado = await abonadoTurnoService.findActivo(usuarioId, turnoId);

  if (!abonado) {
    throw new Error('El cliente no es abonado activo de este turno.');
  }

  await abonadoTurnoService.darDeBaja(abonado.id);
  const reservasFuturasCanceladas = await reservaService.cancelarReservasFuturasAbonadoByUsuarioTurno(
    usuarioId,
    turnoId
  );

  const siguiente = await listaEsperaAbonadoService.findSiguienteEnEspera(turnoId);
  if (siguiente) {
    await listaEsperaAbonadoService.reservarCupo(siguiente.id);
  }

  return {
    message: siguiente
      ? 'Abono dado de baja. Se reservó el cupo para el siguiente cliente en cola.'
      : 'Abono dado de baja. No hay clientes en cola de abonados.',
    siguienteNotificado: siguiente || null,
    reservasFuturasCanceladas
  };
}

export async function aceptarCupoAbonado(usuarioId, turnoId) {
  const turno = await turnoService.getTurnoById(turnoId);
  const abonadosActivos = await abonadoTurnoService.countActivosByTurno(turnoId);

  if (abonadosActivos >= turno.cupo_maximo) {
    throw new Error('El turno ya no tiene cupos fijos disponibles.');
  }

  const abonadoExistente = await abonadoTurnoService.findActivo(usuarioId, turnoId);
  if (abonadoExistente) {
    throw new Error('El cliente ya es abonado activo de este turno.');
  }

  const abonado = await abonadoTurnoService.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    estado: 'ACTIVO'
  });
  const reservasConvertidas = await reservaService.convertirReservasFuturasNoAbonadoAAbonado(
    usuarioId,
    turnoId
  );

  return {
    message: 'Cupo de abonado confirmado correctamente.',
    data: abonado,
    reservasConvertidas
  };
}
