import { SuscripcionAbonado } from '../models/index.model.js';

export async function findSuspendedByUsuarioId(usuarioId) {
    return SuscripcionAbonado.findAll({
        where: {
            usuario_id: usuarioId,
            estado: 'SUSPENDIDA'
        }
    });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
    return SuscripcionAbonado.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}
