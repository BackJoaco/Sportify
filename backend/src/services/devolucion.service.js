import * as devolucionRepository from '../repositories/devolucion.repository.js';

export async function listarDevolucionesPendientes() {
  const reservasCanceladas = await devolucionRepository.getDevolucionesPendientes();

  const devolucionesProcesadas = [];

  for (const reserva of reservasCanceladas) {
    // 1. Armamos la fecha y hora exacta en la que iba a ocurrir la clase
    // Ej: "2026-07-15T08:00:00"
    const fechaTurnoStr = `${reserva.fecha}T${reserva.Turno.hora_inicio}`;
    const fechaTurno = new Date(fechaTurnoStr);
    
    // 2. Obtenemos el momento exacto en el que el cliente canceló
    const fechaCancelacion = new Date(reserva.updatedAt);
    
    // 3. Calculamos la diferencia en horas
    const diferenciaMilisegundos = fechaTurno - fechaCancelacion;
    const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);

    // REGLA 5: Si canceló con 24 horas o menos de anticipación, pierde la seña.
    // Lo descartamos de la lista porque no le debemos plata.
    if (diferenciaHoras <= 24) {
      continue; 
    }

    // REGLA 4: Si llegó hasta acá, canceló con más de 24hs. Corresponde devolver el 50%.
    const totalPagado = reserva.Pagos 
      ? reserva.Pagos.reduce((total, pago) => total + Number(pago.monto), 0) 
      : 0;

    // Calculamos el monto penalizado
    const montoADevolver = totalPagado;

    const metodoPagoOriginal = reserva.Pagos && reserva.Pagos.length > 0
      ? reserva.Pagos[0].metodo_pago
      : 'NO_ESPECIFICADO';

    devolucionesProcesadas.push({
      reserva_id: reserva.id,
      fecha_clase: reserva.fecha,
      actividad: reserva.Turno?.Actividad?.nombre || 'Actividad',
      horario: reserva.Turno?.hora_inicio || 'Sin horario',
      monto_a_devolver: montoADevolver, // Ahora devuelve el 50% exacto
      metodo_pago_original: metodoPagoOriginal,
      estado_pago_reserva: reserva.estado_pago,
      horas_anticipacion: Math.round(diferenciaHoras), // Dato extra útil para el frontend
      usuario: {
        id: reserva.Usuario?.id,
        nombre: `${reserva.Usuario?.nombre} ${reserva.Usuario?.apellido}`,
        dni: reserva.Usuario?.dni,
        email: reserva.Usuario?.email
      }
    });
  }

  return devolucionesProcesadas;
}