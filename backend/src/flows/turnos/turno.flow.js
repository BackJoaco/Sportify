import * as turnoService from "../../services/turno.service.js";
import * as actividadService from "../../services/actividad.service.js";
import * as reservaService from "../../services/reserva.service.js";
import * as abonadoTurnoService from "../../services/abonadoTurno.service.js";
import * as listaEsperaAbonadoService from "../../services/listaEsperaAbonado.service.js";
import * as listaEsperaNoAbonadoService from "../../services/listaEsperaNoAbonado.service.js";

export async function getOcupacionFlow(turnoId, fecha) {
  const turno = await turnoService.getTurnoById(turnoId);
  const abonados = await abonadoTurnoService.findActivosByTurno(turnoId);
  const colaAbonados = await listaEsperaAbonadoService.findByTurno(turnoId);

  let reservasFecha = [];
  let colaNoAbonados = [];
  let cuposDisponiblesFecha = null;

  if (fecha) {
    reservasFecha = await reservaService.findByTurnoFecha(turnoId, fecha);
    colaNoAbonados = await listaEsperaNoAbonadoService.findByTurnoFecha(turnoId, fecha);
    
    const cantidadReservas = await reservaService.countByTurnoAndFecha(turnoId, fecha);
    cuposDisponiblesFecha = turno.cupo_maximo - cantidadReservas;
    // Evitar cupos negativos por las dudas
    if (cuposDisponiblesFecha < 0) cuposDisponiblesFecha = 0;
  }

  return {
    turno,
    fecha: fecha || null,
    cupo_maximo: turno.cupo_maximo,
    abonados,
    colaAbonados,
    reservasFecha,
    colaNoAbonados,
    cuposDisponiblesFecha
  };
}
export async function getReservasCount(turnoId, fecha = null) {
  await turnoService.getTurnoById(turnoId);

  if (fecha) {
    return reservaService.countByTurnoAndFecha(turnoId, fecha);
  }

  return abonadoTurnoService.countActivosByTurno(turnoId);
}

export async function crearTurnoFlow(data) {
  await actividadService.getActividadById(data.actividad_id);
  await turnoService.checkSuperposicion(data.actividad_id, data.dia_semana, data.hora_inicio);

  return turnoService.create({
    ...data,
    dia_semana: String(data.dia_semana ?? '').trim().toUpperCase()
  });
}

export async function modificarTurnoFlow(id, datosNuevos) {
  const turnoExistente = await turnoService.getTurnoById(id);

  const huboCambios =
    (datosNuevos.entrenador && datosNuevos.entrenador !== turnoExistente.entrenador) ||
    (datosNuevos.dia_semana && datosNuevos.dia_semana !== turnoExistente.dia_semana) ||
    (datosNuevos.hora_inicio && datosNuevos.hora_inicio.substring(0, 5) !== turnoExistente.hora_inicio.substring(0, 5)) ||
    (datosNuevos.cupo_maximo && parseInt(datosNuevos.cupo_maximo) !== turnoExistente.cupo_maximo) ||
    (datosNuevos.actividad_id && parseInt(datosNuevos.actividad_id) !== turnoExistente.actividad_id);

  await turnoService.update(id, {
    ...datosNuevos,
    dia_semana: datosNuevos.dia_semana
      ? String(datosNuevos.dia_semana).trim().toUpperCase()
      : undefined
  });

  let reservasCanceladas = 0;
  if (huboCambios) {
    const [afectadas] = await reservaService.cancelarMasivamentePorTurno(id);
    reservasCanceladas = afectadas;
  }

  const turnoActualizado = await turnoService.getTurnoById(id);

  return {
    turno: turnoActualizado,
    impacto: huboCambios,
    reservasCanceladas
  };
}
