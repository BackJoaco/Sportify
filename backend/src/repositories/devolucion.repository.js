import { Reserva, Usuario, Pago, Turno, Actividad } from '../models/index.model.js';
import { Op } from 'sequelize';

export async function getDevolucionesPendientes() {
  return await Reserva.findAll({
    where: {
      tipo_reserva: 'NO_ABONADO',
      estado: 'CANCELADA',
      // Buscamos solo las reservas canceladas que tengan dinero a favor
      estado_pago: { [Op.in]: ['SENA_ABONADA', 'PAGADO_COMPLETO'] }
    },
    include: [
      {
        model: Usuario,
        attributes: ['id', 'nombre', 'apellido', 'dni', 'email']
      },
      {
        model: Pago,
        // Traemos los pagos completados asociados a esa reserva para calcular el monto a devolver
        where: { estado: 'COMPLETADO' },
        attributes: ['id', 'monto', 'tipo_pago', 'metodo_pago'],
        required: false 
      },
      {
        model: Turno,
        attributes: ['hora_inicio', 'dia_semana'],
        include: [
          {
            model: Actividad,
            attributes: ['nombre']
          }
        ]
      }
    ],
    order: [['fecha', 'DESC']] // Mostramos primero las cancelaciones más recientes
  });
}