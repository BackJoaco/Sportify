import { Actividad, Reserva, Turno } from '../models/index.model.js';
import { Op } from 'sequelize';

export async function findById(id) {
    return Reserva.findByPk(id, {
        include: [
            {
                model: Turno,
                include: [Actividad]
            }
        ]
    });
}

export async function findByUsuarioId(usuarioId) {
    return Reserva.findAll({
        where: { usuario_id: usuarioId },
        include: [
            {
                model: Turno,
                include: [Actividad]
            }
        ],
        order: [
            ['fecha', 'ASC'],
            [Turno, 'hora_inicio', 'ASC']
        ]
    });
}

export async function updateEstadoPago(id, estadoPago) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
        return null;
    }

    return reserva.update({ estado_pago: estadoPago });
}

export async function updateEstadoPagoIfPendiente(id, estadoPago) {
  const [affectedRows] = await Reserva.update(
    { estado_pago: estadoPago },
    {
      where: {
        id,
        estado: 'CONFIRMADA',
        estado_pago: 'PENDIENTE'
      }
    }
  );

  if (affectedRows === 0) {
    return null;
  }

  return findById(id);
}

export async function create(data){
    return Reserva.create(data);
}

export async function findPendientesNoAbonadoBefore(fechaLimite) {
  return Reserva.findAll({
    where: {
      tipo_reserva: 'NO_ABONADO',
      estado: 'CONFIRMADA',
      estado_pago: 'PENDIENTE',
      createdAt: { [Op.lte]: fechaLimite }
    },
    include: [
      {
        model: Turno,
        include: [Actividad]
      }
    ],
    order: [['createdAt', 'ASC']]
  });
}

export async function cancelarPendientePorVencimiento(id) {
  const [affectedRows] = await Reserva.update(
    { estado: 'CANCELADA' },
    {
      where: {
        id,
        estado: 'CONFIRMADA',
        estado_pago: 'PENDIENTE'
      }
    }
  );

  return affectedRows;
}

export async function deleteByUsuarioId(usuarioId, transaction) {
  return Reserva.destroy({
    where: { usuario_id: usuarioId },
    transaction
  });
}

export async function countByTurno(turno_id) {
  return await Reserva.count({
    where: {
      turno_id,
      estado: 'CONFIRMADA' // Solo contamos las que ocupan lugar
    }
  });
}

export async function countByTurnoAndFecha(turno_id, fecha, tipo_reserva = null) {
  const where = {
    turno_id,
    fecha,
    estado: 'CONFIRMADA'
  };

  if (tipo_reserva) {
    where.tipo_reserva = tipo_reserva;
  }

  return Reserva.count({ where });
}

export async function countByTurnoFechaTipoEstado(turno_id, fecha, tipo_reserva, estado) {
  return Reserva.count({
    where: {
      turno_id,
      fecha,
      tipo_reserva,
      estado
    }
  });
}

export async function countByTurnoFechaTipoEstadoUsuarios(turno_id, fecha, tipo_reserva, estado, usuarioIds) {
  if (!usuarioIds || usuarioIds.length === 0) {
    return 0;
  }

  return Reserva.count({
    where: {
      turno_id,
      fecha,
      tipo_reserva,
      estado,
      usuario_id: { [Op.in]: usuarioIds }
    }
  });
}

export async function findByTurnoFecha(turno_id, fecha) {
  return Reserva.findAll({
    where: { turno_id, fecha },
    include: [Turno],
    order: [['createdAt', 'ASC']]
  });
}

export async function findActivasByUsuarioAndFecha(usuario_id, fecha) {
  return await Reserva.findAll({
    where: {
      usuario_id,
      fecha,
      estado: 'CONFIRMADA' // Excluimos canceladas
    },
    include: [{
      model: Turno,
      attributes: ['id', 'hora_inicio', 'dia_semana']
    }]
  });
}

export async function findByUsuarioTurnoFecha(usuario_id, turno_id, fecha) {
  return Reserva.findOne({
    where: { usuario_id, turno_id, fecha }
  });
}

export async function convertirReservasFuturasNoAbonadoAAbonado(usuario_id, turno_id) {
  const hoy = new Date().toISOString().split('T')[0];

  const [affectedRows] = await Reserva.update(
    {
      tipo_reserva: 'ABONADO',
      estado_pago: 'PAGADO_COMPLETO'
    },
    {
      where: {
        usuario_id,
        turno_id,
        tipo_reserva: 'NO_ABONADO',
        estado: 'CONFIRMADA',
        fecha: { [Op.gte]: hoy }
      }
    }
  );

  return affectedRows;
}

export async function cancelarReservasFuturasAbonadoByUsuarioTurno(usuario_id, turno_id) {
  const hoy = new Date().toISOString().split('T')[0];

  const [affectedRows] = await Reserva.update(
    { estado: 'CANCELADA' },
    {
      where: {
        usuario_id,
        turno_id,
        tipo_reserva: 'ABONADO',
        estado: 'CONFIRMADA',
        fecha: { [Op.gte]: hoy }
      }
    }
  );

  return affectedRows;
}

export async function updateEstado(id, estado) {
  return Reserva.update({ estado }, { where: { id } });
}

export async function cancelarMasivamentePorTurno(turno_id) {
  return await Reserva.update(
    { estado: 'CANCELADA' }, 
    { 
      where: { 
        turno_id,
        estado: 'CONFIRMADA' 
      } 
    }
  );
}
