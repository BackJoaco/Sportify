import * as listaEsperaNoAbonadoRepository from '../repositories/listaEsperaNoAbonado.repository.js';

export async function agregar(usuarioId, turnoId, fecha) {
  // Buscamos si existe (activo o borrado)
  const existente = await listaEsperaNoAbonadoRepository.findByUsuarioTurnoFechaConBorrados(usuarioId, turnoId, fecha);

  const posicion = (await listaEsperaNoAbonadoRepository.countActivasByTurnoFecha(turnoId, fecha)) + 1;

  if (existente) {
    if (existente.deletedAt) {
      await existente.restore();
    }

    existente.estado = 'EN_ESPERA';
    existente.posicion = posicion;
    existente.cupo_reservado_hasta = null;
    await existente.save();
    return existente;
  }

  // Si no existía de antes, creamos uno nuevo
  const result = await listaEsperaNoAbonadoRepository.create({
    usuario_id: usuarioId,
    turno_id: turnoId,
    fecha: fecha,
    posicion
  });

  return result;
}


export function findSiguienteEnEspera(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findSiguienteEnEspera(turnoId, fecha);
}

export function findByTurnoFecha(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findByTurnoFecha(turnoId, fecha);
}

export async function findSuperpuestasByUsuarioFechaHora(usuarioId, fecha, horaInicio) {
  const esperasActivas = await listaEsperaNoAbonadoRepository.findActivasByUsuarioFecha(
    usuarioId,
    fecha
  );
  const horaNormalizada = String(horaInicio ?? '').slice(0, 5);

  return esperasActivas.filter(
    espera => String(espera.Turno?.hora_inicio ?? '').slice(0, 5) === horaNormalizada
  );
}

export function findActiva(usuarioId, turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findActiva(usuarioId, turnoId, fecha);
}

export function findConfirmada(usuarioId, turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.findConfirmada(usuarioId, turnoId, fecha);
}

export function notificar(id, horas = 1) {
  const hasta = new Date();
  hasta.setHours(hasta.getHours() + horas);
  return listaEsperaNoAbonadoRepository.updateEstado(id, {
    estado: 'NOTIFICADO',
    cupo_reservado_hasta: hasta
  });
}

export function confirmar(id) {
  return listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'CONFIRMADO' });
}

export function expirar(id) {
  return listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'EXPIRADO' });
}

export async function rechazar(id) {
  await listaEsperaNoAbonadoRepository.updateEstado(id, { estado: 'RECHAZADO' });
  return listaEsperaNoAbonadoRepository.deleteById(id);
}

export async function rechazarSuperpuestasByUsuarioFechaHora(
  usuarioId,
  fecha,
  horaInicio,
  esperaIdExcluida = null
) {
  const superpuestas = await findSuperpuestasByUsuarioFechaHora(
    usuarioId,
    fecha,
    horaInicio
  );
  const esperasARechazar = superpuestas.filter(
    espera => String(espera.id) !== String(esperaIdExcluida)
  );

  for (const espera of esperasARechazar) {
    await rechazar(espera.id);
    await reordenarPosiciones(espera.turno_id, espera.fecha, espera.posicion);
  }

  return esperasARechazar;
}

export function deleteById(id) {
  return listaEsperaNoAbonadoRepository.deleteById(id);
}

export function deleteByUsuarioId(usuarioId, transaction) {
  return listaEsperaNoAbonadoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export function reordenarPosiciones(turnoId, fecha, posicionLiberada) {
  return listaEsperaNoAbonadoRepository.reordenarPosiciones(turnoId, fecha, posicionLiberada);
}

export function countWaiting(turnoId, fecha) {
  return listaEsperaNoAbonadoRepository.countWaiting(turnoId, fecha);
}
