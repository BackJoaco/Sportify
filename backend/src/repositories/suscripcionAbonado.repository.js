import { SuscripcionAbonado } from '../models/index.model.js';

export async function deleteByUsuarioId(usuarioId, transaction) {
    return SuscripcionAbonado.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}
