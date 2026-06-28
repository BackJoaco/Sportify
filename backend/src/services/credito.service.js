import * as creditoRepository from '../repositories/credito.repository.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return creditoRepository.deleteByUsuarioId(usuarioId, transaction);
}
