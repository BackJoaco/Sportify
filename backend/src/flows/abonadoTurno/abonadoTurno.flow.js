import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as listaEsperaAbonadoService from '../../services/listaEsperaAbonado.service.js';
import * as reservaService from '../../services/reserva.service.js';
import * as turnoService from '../../services/turno.service.js';
import * as usuarioService from '../../services/usuario.service.js';

import { getRemainingClassesInSportifyMonth } from '../../utils/date.utils.js';

export async function altaAbonado(usuarioId, turnoId, fechaBase = new Date()) {
  const usuario = await usuarioService.getProfile(usuarioId);
  const turno = await turnoService.getTurnoById(turnoId);

  if (usuario.rol !== 'CLIENTE') {
    throw new Error('Solo un cliente puede abonarse a un turno.');
  }

  // Obtener mes actual Sportify
  const refDate = new Date(fechaBase);
  const day = refDate.getDate();
  const jsMonth = refDate.getMonth();
  let currentMonthInt;
  if (day < 11) {
    currentMonthInt = jsMonth === 0 ? 12 : jsMonth;
  } else {
    currentMonthInt = jsMonth + 1;
  }

  const abonadoExistente = await abonadoTurnoService.findActivoByMes(usuarioId, turnoId, currentMonthInt);
  if (abonadoExistente) {
    throw new Error('El cliente ya es abonado activo de este turno.');
  }

  // Calcular las fechas restantes en este mes Sportify
  const remainingDates = getRemainingClassesInSportifyMonth(turno.dia_semana, fechaBase);

  if (remainingDates.length <= 1) {
    throw new Error('No puedes abonarte porque es la última clase del mes o ya no quedan clases.');
  }

  // Validar si el usuario ya tiene reservas NO_ABONADO futuras en el mes
  for (const fecha of remainingDates) {
    const reservaExistente = await reservaService.findByUsuarioTurnoFecha(usuarioId, turnoId, fecha);
    if (reservaExistente && reservaExistente.estado === 'CONFIRMADA' && reservaExistente.tipo_reserva === 'NO_ABONADO') {
      throw new Error(`Ya posees una reserva como no abonado para el día ${fecha}. Si deseas abonarte, por favor cancela tus reservas primero.`);
    }
  }

  // Validar cupos: primero la cantidad global y luego cada clase
  const abonadosActivos = await abonadoTurnoService.countActivosByTurno(turnoId);
  if (abonadosActivos >= turno.cupo_maximo) {
    throw new Error('El turno no tiene cupos fijos disponibles. No es posible abonarse a este turno, por favor inscríbete a la lista de espera de abonados.');
  }

  for (const fecha of remainingDates) {
    const count = await reservaService.countByTurnoAndFecha(turnoId, fecha);
    if (count >= turno.cupo_maximo) {
      throw new Error(`La clase del día ${fecha} ya alcanzó el cupo máximo. No es posible abonarse a este turno, por favor inscríbete a la lista de espera de abonados.`);
    }
  }

  // Crear el abono
  const abonado = await abonadoTurnoService.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    mes_anio: currentMonthInt,
    fecha_alta: new Date().toISOString().split('T')[0],
    estado: 'ACTIVO'
  });

  // Generar las reservas para las clases restantes
  let reservasCreadas = 0;
  for (const fecha of remainingDates) {
    const reservaExistente = await reservaService.findByUsuarioTurnoFecha(usuarioId, turnoId, fecha);
    if (!reservaExistente || reservaExistente.estado !== 'CONFIRMADA') {
      await reservaService.create({
        usuario_id: usuarioId,
        turno_id: turnoId,
        fecha: fecha,
        tipo_reserva: 'ABONADO',
        estado: 'CONFIRMADA',
        estado_pago: 'PAGADO_COMPLETO'
      });
      reservasCreadas++;
    }
  }

  return {
    status: 'ACTIVO',
    message: `Cliente abonado al turno correctamente. Se crearon ${reservasCreadas} reservas.`,
    data: abonado,
    reservasCreadas
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

export async function salirDeColaAbonado(usuarioId, turnoId) {
  const turno = await turnoService.getTurnoById(turnoId);

  const espera = await listaEsperaAbonadoService.findActiva(usuarioId, turnoId);
  if (!espera) {
    throw new Error('No estás en la cola de abonados para este turno.');
  }

  await listaEsperaAbonadoService.deleteById(espera.id);

  return {
    message: 'Saliste de la cola de abonados.',
    turnoId: turno.id
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

export async function ingresarColaAbonado(usuarioId, turnoId, fechaBase = new Date()) {
  const turno = await turnoService.getTurnoById(turnoId);
  if (!turno) {
    throw new Error('El turno especificado no existe.');
  }

  const espera = await listaEsperaAbonadoService.findActiva(usuarioId, turnoId);
  if (espera) {
    throw new Error('Ya estás en la cola de abonados para este turno.');
  }

  const refDate = new Date(fechaBase);
  const day = refDate.getDate();
  const jsMonth = refDate.getMonth();
  const currentMonthInt = day < 11 ? (jsMonth === 0 ? 12 : jsMonth) : (jsMonth + 1);

  const abonoActivo = await abonadoTurnoService.findActivoOSuspendidoByMes(usuarioId, turnoId, currentMonthInt);
  if (abonoActivo) {
    throw new Error('Ya posees un abono vigente para este turno en este mes.');
  }

  const abonadosActivos = await abonadoTurnoService.countActivosByTurno(turnoId);
  let turnoLleno = (abonadosActivos >= turno.cupo_maximo);

  if (!turnoLleno) {
    const remainingDates = getRemainingClassesInSportifyMonth(turno.dia_semana, fechaBase);
    for (const fecha of remainingDates) {
      const count = await reservaService.countByTurnoAndFecha(turnoId, fecha);
      if (count >= turno.cupo_maximo) {
        turnoLleno = true;
        break;
      }
    }
  }

  if (!turnoLleno) {
    throw new Error('Hay cupos disponibles para abonados, puedes abonarte directamente.');
  }

  const result = await listaEsperaAbonadoService.agregar(usuarioId, turnoId);

  return {
    message: 'Ingresaste exitosamente a la cola de abonados.',
    posicion: result.posicion
  };
}
