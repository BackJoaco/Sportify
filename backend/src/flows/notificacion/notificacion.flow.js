import * as abonadoTurnoService from '../../services/abonadoTurno.service.js';
import * as notificacionService from '../../services/notificacion.service.js';
import * as creditoService from '../../services/credito.service.js';
import * as turnoService from '../../services/turno.service.js';
import { Pago } from '../../models/index.model.js';

export async function procesarRecordatorios() {
  const recordatoriosDePago = await procesarRecordatoriosPago();
  const recordatoriosDeCreditosPorVencer = await procesarRecordatoriosCreditoPorVenver();

  return {
    recordatoriosDePago,
    recordatoriosDeCreditosPorVencer
  };
}

export async function procesarRecordatoriosCreditoPorVenver() {
  const usuariosId = await creditoService.obtenerUsuariosConCreditosPorVencer();

  if (!usuariosId){
    return
  }

  let notificacionesCreadas = 0;

  for (const usuarioId of usuariosId) {
    const mensaje = `Recordatorio de vencimiento de creditos: Tienes tiempo hasta el final del dia para usar tus creditos disponibles.`;

    const yaNotificado = await notificacionService.findRepetidaByDia(usuarioId, mensaje);

    if (!yaNotificado) {
      await notificacionService.create({
        usuario_id: usuarioId,
        mensaje,
        leida: false
      });
      notificacionesCreadas++;
    }
  }

  return {
    usuariosProcesados: usuariosId.length,
    notificacionesCreadas
  };
}

export async function procesarRecordatoriosPago(force = false) {
  const today = new Date();
  const day = today.getDate();

  // Validar si la fecha actual está entre el día 1 y el día 10 del mes
  if (!force && (day < 1 || day > 10)) {
    return { message: 'Fuera de rango (días 1 al 10). No se requiere enviar recordatorios.' };
  }

  // today.getMonth() devuelve 0 para Enero, 1 para Febrero, etc.
  // El "mes_anio" actual (periodo que se debe):
  // Ej: si hoy es febrero (JS month = 1), el mes cobrado es enero (Int = 1).
  // Si hoy es enero (JS month = 0), el mes cobrado es diciembre (Int = 12).
  const jsMonth = today.getMonth();
  const currentMonthInt = jsMonth === 0 ? 12 : jsMonth;

  // El mes para el cual se envía el recordatorio (el mes de pago, ej: febrero = 2)
  const newMonthInt = jsMonth + 1;

  // 1. Busque entre todos los abonados_turnos los que se encuentren con estado ACTIVO y el mes_anio sea el actual
  const abonosActuales = await abonadoTurnoService.findActivosByMes(currentMonthInt);

  let notificacionesCreadas = 0;

  for (const abono of abonosActuales) {
    // 2. Verificar que no tenga un abono activo para el mes que se envia el recordatorio de pago
    const abonoNuevo = await abonadoTurnoService.findActivoByMes(abono.usuario_id, abono.turno_id, newMonthInt);

    if (!abonoNuevo) {
      const mensaje = `Recordatorio de Pago: Tienes tiempo hasta el día 10 de este mes para regularizar el pago de tu cuota de abonado.`;
      
      // Evitar duplicados en el mismo dia
      const yaNotificado = await notificacionService.findRepetidaByDia(abono.usuario_id, mensaje);
      if (!yaNotificado) {
        await notificacionService.create({
          usuario_id: abono.usuario_id,
          mensaje,
          leida: false
        });
        notificacionesCreadas++;
        
        // Verificar si ya se le genero el pago pendiente para este abono
        const pagoPendiente = await Pago.findOne({
          where: {
            abonado_turno_id: abono.id,
            estado: 'PENDIENTE',
            tipo_pago: 'SUSCRIPCION_MENSUAL'
          }
        });

        if (!pagoPendiente) {
          const turno = await turnoService.getTurnoById(abono.turno_id);
          const montoMes = turno.Actividad?.precio_mensual || 0;
          
          await Pago.create({
            usuario_id: abono.usuario_id,
            monto: montoMes,
            tipo_pago: 'SUSCRIPCION_MENSUAL',
            estado: 'PENDIENTE',
            abonado_turno_id: abono.id
          });
        }
      }
    }
  }

  return {
    suscripcionesProcesadas: abonosActuales.length,
    notificacionesCreadas
  };
}
