import { Credito } from '../models/index.model.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return Credito.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}
