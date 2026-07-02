import * as devolucionRepository from '../repositories/devolucion.repository.js';

export async function listarDevolucionesPendientes() {
  const reservasCanceladas = await devolucionRepository.getDevolucionesPendientes();

  return reservasCanceladas.map(reserva => {
    // Calculamos el monto total a devolver sumando los pagos de esta reserva
    const montoADevolver = reserva.Pagos 
      ? reserva.Pagos.reduce((total, pago) => total + Number(pago.monto), 0) 
      : 0;

    // Buscamos el método de pago original para orientar al empleado (ej: si pagó por Mercado Pago, se devuelve ahí)
    const metodoPagoOriginal = reserva.Pagos && reserva.Pagos.length > 0
      ? reserva.Pagos[0].metodo_pago
      : 'NO_ESPECIFICADO';

    return {
      reserva_id: reserva.id,
      fecha_clase: reserva.fecha,
      actividad: reserva.Turno?.Actividad?.nombre || 'Actividad',
      horario: reserva.Turno?.hora_inicio || 'Sin horario',
      monto_a_devolver: montoADevolver,
      metodo_pago_original: metodoPagoOriginal,
      estado_pago_reserva: reserva.estado_pago,
      usuario: {
        id: reserva.Usuario?.id,
        nombre: `${reserva.Usuario?.nombre} ${reserva.Usuario?.apellido}`,
        dni: reserva.Usuario?.dni,
        email: reserva.Usuario?.email
      }
    };
  });
}