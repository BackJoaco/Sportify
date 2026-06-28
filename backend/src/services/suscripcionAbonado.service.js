import * as suscripcionAbonadoRepository from '../repositories/suscripcionAbonado.repository.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return suscripcionAbonadoRepository.deleteByUsuarioId(usuarioId, transaction);
}
