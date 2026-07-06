import * as usuarioRepository from '../repositories/usuario.repository.js';
import * as notificacionRepository from '../repositories/notificacion.repository.js'
import * as listaEsperaAbonadoRepository from '../repositories/listaEsperaAbonado.repository.js';
import * as listaEsperaNoAbonadoRepository from '../repositories/listaEsperaNoAbonado.repository.js';
import { Turno, Actividad } from '../models/index.model.js';

export async function findByUsuarioId(usuarioId) {
  return notificacionRepository.findByUsuarioId(usuarioId);
}

export async function countUnreadByUsuarioId(usuarioId) {
  return notificacionRepository.countUnreadByUsuarioId(usuarioId);
}

export async function markAsRead(id, usuarioId) {
  const notificacion = await notificacionRepository.markAsRead(id, usuarioId);

  if (!notificacion) {
    throw new Error('Notificacion no encontrada.');
  }

  return notificacion;
}

export async function markAllAsRead(usuarioId) {
  return notificacionRepository.markAllAsRead(usuarioId);
}

export async function create(data) {
  return notificacionRepository.create(data);
}

export async function findRepetida(usuarioId, mensaje) {
  return notificacionRepository.findRepetida(usuarioId, mensaje);
}


export async function notificarAltaDemanda(turnoId, fecha) {
  const turno = await Turno.findByPk(turnoId, { include: [Actividad] });
  const actividadNombre = turno?.Actividad?.nombre || 'Actividad';
  const diaSemana = turno?.dia_semana || '';
  const horaInicio = turno?.hora_inicio || '';

  const mensaje = `Alta demanda detectada para el turno de ${actividadNombre} en la fecha ${fecha} que cae (${diaSemana} a las ${horaInicio.substring(0, 5)} hs).`;

  // Buscar todos los admins
  const admins = await usuarioRepository.findAllAdmins();
  for (const admin of admins) {
    // Evitar notificaciones repetidas idénticas no leídas
    const existente = await notificacionRepository.findRepetida(admin.id, mensaje);
    if (!existente) {
      await notificacionRepository.create({
        usuario_id: admin.id,
        mensaje,
        leida: false,
        fecha_creacion: new Date()
      });
    }
  }
}