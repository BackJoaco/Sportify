import { Op } from 'sequelize';
import * as notificacionRepository from '../repositories/notificacion.repository.js';
import * as listaEsperaAbonadoRepository from '../repositories/listaEsperaAbonado.repository.js';
import * as listaEsperaNoAbonadoRepository from '../repositories/listaEsperaNoAbonado.repository.js';
import * as usuarioRepository from '../repositories/usuario.repository.js';
import { SuscripcionAbonado, Pago, Turno, Actividad } from '../models/index.model.js';

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

export async function verificarYGenerarRecordatoriosPago(force = false) {
  const today = new Date();
  const day = today.getDate();

  // Validar si la fecha actual está entre el día 1 y el día 10 del mes
  if (!force && (day < 1 || day > 10)) {
    return { message: 'Fuera de rango (días 1 al 10). No se requiere enviar recordatorios.' };
  }

  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

  // Buscar suscripciones activas del mes corriente
  const suscripciones = await SuscripcionAbonado.findAll({
    where: {
      mes_anio: {
        [Op.between]: [startDate, endDate]
      },
      estado: 'ACTIVA'
    },
    include: [{
      model: Pago,
      required: false,
      where: {
        tipo_pago: 'SUSCRIPCION_MENSUAL',
        estado: 'COMPLETADO'
      }
    }]
  });

  let notificacionesCreadas = 0;

  for (const sub of suscripciones) {
    // Si no tiene pagos completados de tipo SUSCRIPCION_MENSUAL, está pendiente
    if (!sub.Pagos || sub.Pagos.length === 0) {
      const mensaje = `Recordatorio de Pago: Tienes tiempo hasta el día 10 de este mes para regularizar el pago de tu cuota de abonado.`;
      
      // Evitar duplicados en el mismo mes
      const yaNotificado = await notificacionRepository.findRepetida(sub.usuario_id, mensaje);
      if (!yaNotificado) {
        await notificacionRepository.create({
          usuario_id: sub.usuario_id,
          mensaje,
          leida: false,
          fecha_creacion: new Date()
        });
        notificacionesCreadas++;
      }
    }
  }

  return {
    suscripcionesProcesadas: suscripciones.length,
    notificacionesCreadas
  };
}

export async function verificarYNotificarAltaDemanda(turnoId) {
  const countAbonados = await listaEsperaAbonadoRepository.countWaiting(turnoId);
  const countNoAbonados = await listaEsperaNoAbonadoRepository.countWaiting(turnoId);
  const totalWaiting = countAbonados + countNoAbonados;

  if (totalWaiting > 10) {
    const turno = await Turno.findByPk(turnoId, { include: [Actividad] });
    const actividadNombre = turno?.Actividad?.nombre || 'Actividad';
    const diaSemana = turno?.dia_semana || '';
    const horaInicio = turno?.hora_inicio || '';
    
    const mensaje = `Alta demanda detectada para el turno de ${actividadNombre} (${diaSemana} a las ${horaInicio.substring(0, 5)} hs). Hay ${totalWaiting} personas esperando cupo.`;
    
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
}