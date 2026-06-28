import * as listaEsperaRepository from '../repositories/listaEspera.repository.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return listaEsperaRepository.deleteByUsuarioId(usuarioId, transaction);
}
