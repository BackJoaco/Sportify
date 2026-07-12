import * as creditoRepository from '../repositories/credito.repository.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return creditoRepository.deleteByUsuarioId(usuarioId, transaction);
}

export async function create(data) {
    return creditoRepository.create(data);
}

export async function obtenerHistorial(usuarioId) {
  const creditos = await creditoRepository.getHistorialByUsuario(usuarioId);
  const ahora = new Date();

  // Mapeamos los resultados para darles formato y asegurar la consistencia del estado
  return creditos.map(credito => {
    return {
      id: credito.id,
      fecha_obtencion: credito.createdAt, // Cuándo se le otorgó el crédito
      fecha_vencimiento: credito.fecha_vencimiento,
      estado: credito.estado,
    };
  });
}

export async function obtenerUsuariosConCreditosPorVencer() {
  const usuarios = await creditoRepository.getUsuariosConCreditosPorVencer();

  return usuarios;
}