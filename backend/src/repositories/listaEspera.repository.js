import { ListaEspera } from '../models/index.model.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return ListaEspera.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}
