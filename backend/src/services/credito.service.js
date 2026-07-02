import * as creditoRepository from '../repositories/credito.repository.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return creditoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export async function obtenerHistorial(usuarioId) {
  const creditos = await creditoRepository.getHistorialByUsuario(usuarioId);
  const ahora = new Date();

  // Mapeamos los resultados para darles formato y asegurar la consistencia del estado
  return creditos.map(credito => {
    let estadoActual = credito.estado;
    const fechaVencimiento = new Date(credito.fecha_vencimiento);

    // Regla de negocio de seguridad: Si dice disponible pero la fecha ya pasó, se considera vencido
    if (estadoActual === 'DISPONIBLE' && fechaVencimiento < ahora) {
      estadoActual = 'VENCIDO';
    }

    return {
      id: credito.id,
      fecha_obtencion: credito.createdAt, // Cuándo se le otorgó el crédito
      fecha_vencimiento: credito.fecha_vencimiento,
      estado: estadoActual,
      reserva_origen_id: credito.reserva_origen_id
    };
  });
}
