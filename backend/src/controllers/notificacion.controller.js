import * as notificacionService from '../services/notificacion.service.js';
import * as notificacionFlow from '../flows/notificacion/notificacion.flow.js';

export async function getMisNotificaciones(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const notificaciones = await notificacionService.findByUsuarioId(usuarioId);
    const noLeidas = await notificacionService.countUnreadByUsuarioId(usuarioId);

    return res.status(200).json({
      notificaciones,
      no_leidas: noLeidas
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function marcarComoLeida(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID de notificacion invalido.' });
    }

    const notificacion = await notificacionService.markAsRead(id, usuarioId);

    return res.status(200).json({
      message: 'Notificacion marcada como leida.',
      notificacion
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function marcarTodasComoLeidas(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const actualizadas = await notificacionService.markAllAsRead(usuarioId);

    return res.status(200).json({
      message: 'Notificaciones actualizadas.',
      actualizadas
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function procesarRecordatoriosPago(req, res) {
  try {
    const resultado = await notificacionFlow.procesarRecordatoriosPago();
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}