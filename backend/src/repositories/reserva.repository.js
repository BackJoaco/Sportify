import { Actividad, Reserva, Turno } from '../models/index.model.js';

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
            [Turno, 'fecha', 'ASC'],
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

export async function create(data){
    return Reserva.create(data);
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

export async function findActivasByUsuarioAndFecha(usuario_id, fecha) {
  return await Reserva.findAll({
    where: {
      usuario_id,
      estado: 'CONFIRMADA' // Excluimos canceladas
    },
    include: [{
      model: Turno,
      where: { fecha }, // Filtramos por la fecha del Turno asociado
      attributes: ['id', 'hora_inicio', 'fecha'] 
    }]
  });
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
