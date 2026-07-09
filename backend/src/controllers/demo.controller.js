// import { Op } from 'sequelize';
// import { SuscripcionAbonado, Pago, AbonadoTurno, Usuario, ListaEsperaAbonado, ListaEsperaNoAbonado, Reserva } from '../models/index.model.js';
// import * as notificacionService from '../services/notificacion.service.js';
// import * as listaEsperaNoAbonadoService from '../services/listaEsperaNoAbonado.service.js';
// import { cancelarReserva, asignarSiguienteWaitlist } from '../flows/reserva/reserva.flow.js';
import { processExpiredWaitlists } from '../utils/waitlistScheduler.js'

// export async function simularDias1a10(req, res) {
//   try {
//     const resultado = await notificacionService.verificarYGenerarRecordatoriosPago(true); // force bypass day range check
//     return res.status(200).json({
//       message: 'Simulación de días 1 al 10 (Recordatorios de pago) ejecutada.',
//       resultado
//     });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// }

// export async function simularDia11(req, res) {
//   try {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = today.getMonth();
//     const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
//     const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

//     // Buscar suscripciones activas del mes actual
//     const suscripciones = await SuscripcionAbonado.findAll({
//       where: {
//         mes_anio: { [Op.between]: [startDate, endDate] },
//         estado: 'ACTIVA'
//       },
//       include: [{
//         model: Pago,
//         required: false,
//         where: {
//           tipo_pago: 'SUSCRIPCION_MENSUAL',
//           estado: 'COMPLETADO'
//         }
//       }]
//     });

//     let suspendidas = 0;

//     for (const sub of suscripciones) {
//       // Si no tiene pagos completados, es deudor
//       if (!sub.Pagos || sub.Pagos.length === 0) {
//         // 1. Suscribir a SUSPENDIDA
//         await sub.update({ estado: 'SUSPENDIDA' });

//         // 2. Dar de baja abonos a turnos fijos (AbonadoTurno)
//         await AbonadoTurno.update(
//           { estado: 'BAJA', fecha_baja: new Date() },
//           { where: { usuario_id: sub.usuario_id, estado: 'ACTIVO' } }
//         );

//         // 3. Crear notificación al cliente
//         await notificacionService.create({
//           usuario_id: sub.usuario_id,
//           mensaje: `Tu suscripción ha sido suspendida por falta de pago y se han dado de baja tus abonos a turnos fijos.`,
//           leida: false,
//           fecha_creacion: new Date()
//         });

//         suspendidas++;
//       }
//     }

//     return res.status(200).json({
//       message: 'Simulación del Día 11 (Ejecutar Suspensiones) ejecutada.',
//       suscripcionesProcesadas: suscripciones.length,
//       suspendidasCount: suspendidas
//     });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// }

// export async function forzarCancelacion(req, res) {
//   try {
//     const turnoId = Number(req.body.turno_id || req.query.turno_id);
//     if (!turnoId) {
//       return res.status(400).json({ message: 'El ID de turno es obligatorio.' });
//     }

//     // Buscar una reserva activa para este turno
//     const reserva = await Reserva.findOne({
//       where: {
//         turno_id: turnoId,
//         estado: 'CONFIRMADA'
//       }
//     });

//     if (!reserva) {
//       return res.status(400).json({ message: 'No hay reservas activas en este turno para forzar la cancelación.' });
//     }

//     // Ejecutar el flujo de cancelación
//     const resultado = await cancelarReserva(reserva.id, reserva.usuario_id);

//     return res.status(200).json({
//       message: 'Simulación de cancelación de reserva completada y cupo liberado.',
//       reservaCanceladaId: reserva.id,
//       clienteCanceladoId: reserva.usuario_id,
//       flowResult: resultado
//     });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// }

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

// export async function simularAltaDemanda(req, res) {
//   try {
//     const turnoId = Number(req.body.turno_id || req.query.turno_id);
//     if (!turnoId) {
//       return res.status(400).json({ message: 'El ID de turno es obligatorio.' });
//     }

//     const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
//     const dummyUsers = [];

//     // Generar 11 usuarios ficticios
//     for (let i = 1; i <= 11; i++) {
//       const email = `dummy_demo_${turnoId}_${i}_${Math.floor(Math.random() * 1000)}@sportify.com`;
//       const [dummy] = await Usuario.findOrCreate({
//         where: { email },
//         defaults: {
//           nombre: 'Usuario Demo',
//           apellido: String(i),
//           dni: `DMY-${turnoId}-${i}-${Math.floor(Math.random() * 1000000)}`,
//           rol: 'CLIENTE',
//           estado: 'HABILITADO'
//         }
//       });
//       dummyUsers.push(dummy);
//     }

//     // Inscribirlos a todos en la lista de espera
//     for (const dummy of dummyUsers) {
//       await listaEsperaNoAbonadoService.agregar(dummy.id, turnoId, tomorrowStr);
//     }

//     return res.status(200).json({
//       message: 'Inyección de alta demanda ejecutada exitosamente. Se inyectaron 11 usuarios ficticios en la lista de espera.',
//       turnoId,
//       fecha: tomorrowStr
//     });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// }
