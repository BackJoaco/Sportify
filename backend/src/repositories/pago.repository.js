import { Actividad, Pago, Reserva, Turno, Usuario, AbonadoTurno } from '../models/index.model.js';
import { Op } from 'sequelize'; 

export async function create(data) {
    return Pago.create(data);
}

export async function findByUsuarioId(usuarioId) {
    return Pago.findAll({
        where: { usuario_id: usuarioId },
        include: [
            {
                model: Reserva,
                include: [
                    {
                        model: Turno,
                        include: [Actividad]
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
    });
}

export async function deleteByUsuarioId(usuarioId, transaction) {
    return Pago.destroy({
        where: { usuario_id: usuarioId },
        transaction
    });
}

export async function findSenaCompletadaByReserva(reservaId) {
    return Pago.findOne({
        where: {
            reserva_id: reservaId,
            tipo_pago: 'SENA',
            estado: 'COMPLETADO'
        }
    });
}

export async function getPagosPendientes() {
  return await Pago.findAll({
    where: {
      estado: 'PENDIENTE',
      tipo_pago: {
        [Op.ne]: 'DEVOLUCION_SENA' 
      }
    },
    include: [
      {
        model: Usuario,
        attributes: ['id', 'nombre', 'apellido', 'dni', 'email']
      },
      // Traemos datos si la deuda es de una suscripción mensual
      {
        model: AbonadoTurno,
        required: false,
        include: [{
          model: Turno,
          attributes: ['dia_semana', 'hora_inicio'],
          include: [{ model: Actividad, attributes: ['nombre'] }]
        }]
      },
      // Traemos datos si la deuda es de un turno normal (no abonado)
      {
        model: Reserva,
        required: false,
        include: [{
          model: Turno,
          attributes: ['dia_semana', 'hora_inicio'],
          include: [{ model: Actividad, attributes: ['nombre'] }]
        }]
      }
    ],
    order: [['createdAt', 'DESC']] // Los más recientes primero
  });
}

export async function getTodosLosMovimientos() {
  return await Pago.findAll({
    // Al no poner 'where', traemos TODOS los movimientos sin importar el estado o tipo
    include: [
      {
        model: Usuario,
        attributes: ['id', 'nombre', 'apellido', 'dni', 'email']
      },
      // Traemos datos si el movimiento pertenece a un turno normal / devolución de seña
      {
        model: Reserva,
        required: false,
        include: [{
          model: Turno,
          attributes: ['dia_semana', 'hora_inicio'],
          include: [{ model: Actividad, attributes: ['nombre'] }]
        }]
      },
      // Traemos datos si el movimiento pertenece a una suscripción mensual
      {
        model: AbonadoTurno,
        required: false,
        include: [{
          model: Turno,
          attributes: ['dia_semana', 'hora_inicio'],
          include: [{ model: Actividad, attributes: ['nombre'] }]
        }]
      }
    ],
    order: [['createdAt', 'DESC']] // Los más recientes primero
  });
}