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
    const { turno_id, fecha, tarjetaDebito } = req.body;
    const usuario_id = req.usuario.id;

    if (!turno_id || !fecha) {
      return res.status(400).json({
        mensaje: 'Los campos turno_id y fecha son obligatorios.'
      });
    }

    const resultado = await reservaFlow.createConSena(usuario_id, turno_id, fecha, tarjetaDebito);

    return res.status(201).json({
      mensaje: resultado.message,
      ...resultado
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message
    });
  }
}

export async function crearConCredito(req, res) {
  try {
    const { turno_id, fecha } = req.body;
    const usuario_id = req.usuario.id;

    if (!turno_id || !fecha) {
      return res.status(400).json({
        mensaje: 'Los campos turno_id y fecha son obligatorios.'
      });
    }

    const resultado = await reservaFlow.createConCredito(usuario_id, turno_id, fecha);

    return res.status(201).json({
      mensaje: resultado.message,
      ...resultado
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message
    });
  }
}

export async function cancelarReserva(req, res) {
  try {
    const { id } = req.params;
    const resultado = await reservaFlow.cancelarReserva(id, req.usuario.id);

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function cancelarClaseAbonado(req, res) {
  try {
    const { turno_id, fecha } = req.body;

    if (!turno_id || !fecha) {
      return res.status(400).json({
        mensaje: 'Debe indicar turno_id y fecha.'
      });
    }

    const resultado = await reservaFlow.cancelarClaseAbonado(req.usuario.id, turno_id, fecha);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function salirDeColaNoAbonado(req, res) {
  try {
    const { turno_id, fecha } = req.body;

    if (!turno_id || !fecha) {
      return res.status(400).json({
        mensaje: 'Debe indicar turno_id y fecha.'
      });
    }

    const resultado = await reservaFlow.salirDeColaNoAbonado(req.usuario.id, turno_id, fecha);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function ingresarColaNoAbonado(req, res) {
  try {
    const { turno_id, fecha } = req.body;

    if (!turno_id || !fecha) {
      return res.status(400).json({
        mensaje: 'Debe indicar un turno con fecha'
      });
    }

    const resultado = await reservaFlow.ingresarColaNoAbonado(req.usuario.id, turno_id, fecha);
    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function crearReservaPorEmpleado(req, res) {
  try {
    const { usuario_id, turno_id, fecha } = req.body;

    if (!usuario_id || !turno_id || !fecha) {
      return res.status(400).json({
        mensaje: 'Debe seleccionar un cliente, un turno y una fecha.'
      });
    }

    const cliente = await usuarioService.getProfile(usuario_id);

    if (cliente.rol !== 'CLIENTE') {
      return res.status(400).json({
        mensaje: 'Solo se puede inscribir a usuarios con rol Cliente.'
      });
    }

    const resultado = await reservaFlow.create(usuario_id, turno_id, fecha);

    return res.status(201).json({
      mensaje: resultado.message,
      ...resultado
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message
    });
  }
}
