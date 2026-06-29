import { sequelize } from '../../config/database.js';
import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as creditoService from '../../services/credito.service.js';
import * as listaEsperaService from '../../services/listaEspera.service.js';
import * as listaEsperaAbonadoService from '../../services/listaEsperaAbonado.service.js';
import * as listaEsperaNoAbonadoService from '../../services/listaEsperaNoAbonado.service.js';
import * as pagoService from '../../services/pago.service.js';
import * as reservaService from '../../services/reserva.service.js';
import * as suscripcionAbonadoService from '../../services/suscripcionAbonado.service.js';
import * as usuarioService from '../../services/usuario.service.js';

export async function deleteClientAccountFlow(usuarioId) {
    return sequelize.transaction(async (transaction) => {
        const usuario = await usuarioService.findByIdIncludingDeleted(usuarioId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!usuario || usuario.deletedAt) {
            return { alreadyDeleted: true };
        }

        if (usuario.rol !== 'CLIENTE') {
            throw new Error('Solo los clientes pueden darse de baja desde su perfil');
        }

        const creditosEliminados = await creditoService.deleteByUsuarioId(usuarioId, transaction);
        const listasEsperaEliminadas = await listaEsperaService.deleteByUsuarioId(usuarioId, transaction);
        const listasEsperaAbonadosEliminadas = await listaEsperaAbonadoService.deleteByUsuarioId(usuarioId, transaction);
        const listasEsperaNoAbonadosEliminadas = await listaEsperaNoAbonadoService.deleteByUsuarioId(usuarioId, transaction);
        const abonosTurnosEliminados = await abonadoTurnoService.deleteByUsuarioId(usuarioId, transaction);
        const pagosEliminados = await pagoService.deleteByUsuarioId(usuarioId, transaction);
        const suscripcionesEliminadas = await suscripcionAbonadoService.deleteByUsuarioId(
            usuarioId,
            transaction
        );
        const reservasEliminadas = await reservaService.deleteByUsuarioId(usuarioId, transaction);
        const usuarioEliminado = await usuarioService.deleteUsuarioInstance(usuario, transaction);

        return {
            alreadyDeleted: false,
            deleted: {
                creditos: creditosEliminados,
                listasEspera: listasEsperaEliminadas,
                listasEsperaAbonados: listasEsperaAbonadosEliminadas,
                listasEsperaNoAbonados: listasEsperaNoAbonadosEliminadas,
                abonosTurnos: abonosTurnosEliminados,
                pagos: pagosEliminados,
                suscripciones: suscripcionesEliminadas,
                reservas: reservasEliminadas,
                usuario: usuarioEliminado
            }
        };
    });
}
