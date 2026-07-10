import { ListaEsperaAbonado, ListaEsperaNoAbonado } from '../models/index.model.js';
import { Op } from 'sequelize';
import {
  asignarSiguienteWaitlist,
  procesarReservasAsignadasSinSenaVencidas
} from '../flows/reserva/reserva.flow.js';
import * as turnoService from '../services/turno.service.js';
import { getRemainingClassesInSportifyMonth } from './date.utils.js';

export async function processExpiredWaitlists(simularHoras = 0) {
  try {
    const now = new Date();
    if (simularHoras > 0) {
      now.setHours(now.getHours() + simularHoras);
    }

    await procesarReservasAsignadasSinSenaVencidas(now);

    // 1. Procesar ListaEsperaAbonado
    const abonadosExpirados = await ListaEsperaAbonado.findAll({
      where: {
        estado: 'NOTIFICADO',
        cupo_reservado_hasta: { [Op.lt]: now }
      }
    });

    const turnosAbonadosExpirados = new Set();
    for (const abonado of abonadosExpirados) {
      abonado.estado = 'EXPIRADO';
      await abonado.save();
      turnosAbonadosExpirados.add(abonado.turno_id);
    }

    // 2. Procesar ListaEsperaNoAbonado
    const noAbonadosExpirados = await ListaEsperaNoAbonado.findAll({
      where: {
        estado: 'NOTIFICADO',
        cupo_reservado_hasta: { [Op.lt]: now }
      }
    });

    const turnosFechasNoAbonadosExpirados = new Map(); // key: "turnoId_fecha"
    for (const noAbonado of noAbonadosExpirados) {
      noAbonado.estado = 'EXPIRADO';
      await noAbonado.save();

      const key = `${noAbonado.turno_id}_${noAbonado.fecha}`;
      if (!turnosFechasNoAbonadosExpirados.has(key)) {
        turnosFechasNoAbonadosExpirados.set(key, { turnoId: noAbonado.turno_id, fecha: noAbonado.fecha });
      }
    }

    // 3. Llamar a asignarSiguienteWaitlist por cada turno de abonados
    const turnosTomadosPorAbonado = new Set();
    for (const turnoId of turnosAbonadosExpirados) {
      // Pasamos false para que NO asigne a un no_abonado con la fecha de hoy, ya que la fecha correcta la manejaremos en el paso 4.
      const result = await asignarSiguienteWaitlist(turnoId, new Date(), false);
      if (result && result.esAbonado) {
        // Un nuevo abonado tomó el cupo global
        turnosTomadosPorAbonado.add(turnoId);
      } else {
        // Ningún abonado tomó el cupo global. 
        // Desglosamos el cupo en fechas individuales para notificar a los no abonados en cada fecha restante.
        const turno = await turnoService.getTurnoById(turnoId);
        const remainingDates = getRemainingClassesInSportifyMonth(turno.dia_semana, new Date());
        for (const date of remainingDates) {
          const key = `${turnoId}_${date}`;
          if (!turnosFechasNoAbonadosExpirados.has(key)) {
            turnosFechasNoAbonadosExpirados.set(key, { turnoId, fecha: date });
          }
        }
      }
    }

    // 4. Llamar a asignarSiguienteWaitlist por cada turno/fecha de no abonados
    for (const { turnoId, fecha } of turnosFechasNoAbonadosExpirados.values()) {
      // Solo si no fue tomado completamente por un nuevo abonado en el paso 3
      if (!turnosTomadosPorAbonado.has(turnoId)) {
        await asignarSiguienteWaitlist(turnoId, fecha);
      }
    }

  } catch (error) {
    console.error('Error procesando expiraciones de listas de espera:', error);
  }
}

export function startWaitlistScheduler(intervalMs = 60000) {
  // Ejecutar cada minuto (60000 ms) por defecto
  setInterval(() => {
    processExpiredWaitlists();
  }, intervalMs);

  console.log('✅ Scheduler de listas de espera iniciado');
}
