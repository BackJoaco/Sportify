import * as reservaService from '../services/reserva.service.js';
import * as reservaFlow from '../flows/reserva/reserva.flow.js';
import * as usuarioService from '../services/usuario.service.js';

export async function getMisReservas(req, res) {
    try {
        const { id } = req.usuario;
        const reservas = await reservaService.findByUsuarioId(id);

        return res.status(200).json(reservas);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function getReservasCliente(req, res) {
    try {
        const { usuarioId } = req.params;
        const reservas = await reservaService.findByUsuarioId(usuarioId);

        return res.status(200).json(reservas);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function getReservasClientePorDni(req, res) {
    try {
        const dni = String(req.params.dni ?? '').trim();

        if (!dni) {
            return res.status(400).json({ message: 'Debe ingresar un DNI.' });
        }

        const cliente = await usuarioService.findByDni(dni);

        if (!cliente || cliente.rol !== 'CLIENTE') {
            return res.status(404).json({ message: 'No se encontro un cliente con ese DNI.' });
        }

        const reservas = await reservaService.findByUsuarioId(cliente.id);

        return res.status(200).json({
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                dni: cliente.dni,
                email: cliente.email
            },
            reservas
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


export async function create(req, res) {
  try {
    const { usuario_id, turno_id } = req.body;

    if (!usuario_id || !turno_id) {
      return res.status(400).json({ 
        mensaje: 'Los campos usuario_id y turno_id son obligatorios.' 
      });
    }

    // Llamamos al flow
    const reserva = await reservaFlow.create(usuario_id, turno_id);

    return res.status(201).json({
      mensaje: 'Reserva creada con éxito.',
      data: reserva
    });
    
  } catch (error) {
    // Manejo de errores de reglas de negocio
    return res.status(400).json({ 
      mensaje: error.message 
    });
  }
}

export async function cancelarReserva(req, res) {
  try {
    const { id } = req.params;
    const resultado = await reservaFlow.cancelarReserva(id);
    
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
export async function crearReservaPorEmpleado(req, res) {
  try {
    const { usuario_id, turno_id } = req.body;

    if (!usuario_id || !turno_id) {
      return res.status(400).json({ 
        mensaje: 'Debe seleccionar un cliente y un turno.' 
      });
    }

    const reserva = await reservaFlow.create(usuario_id, turno_id);

    return res.status(201).json({
      mensaje: 'Reserva generada exitosamente por administración.',
      data: reserva
    });
    
  } catch (error) {
    return res.status(400).json({ 
      mensaje: error.message 
    });
  }
}
