import { cancelarReserva, asignarSiguienteWaitlist } from '../flows/reserva/reserva.flow.js';
import { processExpiredWaitlists } from '../utils/waitlistScheduler.js'
import { Reserva, Credito } from '../models/index.model.js';
import { Op } from 'sequelize';
import { runSeed } from '../seed.js';


export async function forzarCancelacion(req, res) {
  try {
    const turnoId = Number(req.body.turno_id || req.query.turno_id);
    if (!turnoId) {
      return res.status(400).json({ message: 'El ID de turno es obligatorio.' });
    }

    // Buscar una reserva activa para este turno
    const reserva = await Reserva.findOne({
      where: {
        turno_id: turnoId,
        estado: 'CONFIRMADA'
      }
    });

    if (!reserva) {
      return res.status(400).json({ message: 'No hay reservas activas en este turno para forzar la cancelación.' });
    }

    // Ejecutar el flujo de cancelación
    const resultado = await cancelarReserva(reserva.id, reserva.usuario_id);

    return res.status(200).json({
      message: 'Simulación de cancelación de reserva completada y cupo liberado.',
      reservaCanceladaId: reserva.id,
      clienteCanceladoId: reserva.usuario_id,
      flowResult: resultado
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function simularExpiracion(req, res) {
  try {
    await processExpiredWaitlists(1);
    return res.status(200).json({
      message: 'Simulación del paso de 1 hora (Expiraciones) completada.',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function generarCreditoAVencer(req, res) {
  try {
    const usuarioId = 2;
    const turnoId = 5;
    const fecha = '2026-06-16';

    // 1. Crear o encontrar la reserva cancelada
    const [reserva] = await Reserva.findOrCreate({
      where: { usuario_id: usuarioId, turno_id: turnoId, fecha: fecha },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'CANCELADA',
        estado_pago: 'PAGADO_COMPLETO',
        codigo_qr: `QR-DEMO-${turnoId}-${usuarioId}-${fecha}`
      }
    });

    // 2. Crear el crédito que vence hoy
    const today = new Date();
    await Credito.create({
      usuario_id: usuarioId,
      estado: 'DISPONIBLE',
      reserva_origen_id: reserva.id,
      fecha_vencimiento: today,
    });

    return res.status(200).json({
      message: 'Crédito a punto de vencer generado con éxito.',
      reserva,
      fecha_vencimiento: today
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function expirarCreditoDemo(req, res) {
  try {
    const usuarioId = 2;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Buscar el crédito disponible del usuario 2 que expire HOY
    const credito = await Credito.findOne({
      where: {
        usuario_id: usuarioId,
        estado: 'DISPONIBLE',
        fecha_vencimiento: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    if (!credito) {
      return res.status(400).json({ message: 'No se encontró un crédito disponible para expirar que venza el día de hoy.' });
    }

    // Cambiar la fecha de vencimiento a ayer
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    await credito.update({ fecha_vencimiento: ayer });

    return res.status(200).json({
      message: 'Crédito actualizado con fecha de vencimiento en el pasado.',
      credito
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function resetDatabase(req, res) {
  try {
    await runSeed({ force: true });
    return res.status(200).json({
      message: 'Base de datos reseteada y seed ejecutado correctamente.',
    });
  } catch (error) {
    console.error('Error al resetear la base de datos y correr el seed:', error);
    return res.status(500).json({
      message: 'Error al resetear la base de datos.',
      error: error.message
    });
  }
}
