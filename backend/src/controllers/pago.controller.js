import {
    obtenerMontoSenaReservaCliente,
    obtenerMontoSenaTurnoCliente,
    obtenerMontoSuscripcionMensualCliente,
    pagarSenaPresencial,
    pagarSenaReservaCliente,
    pagarSuscripcionMensualCliente
} from '../flows/payment/pago.flow.js';
import * as pagoService from '../services/pago.service.js';

export async function getMisPagos(req, res) {
    try {
        const pagos = await pagoService.findByUsuarioId(req.usuario.id);

        return res.status(200).json(pagos);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function pagarSena(req, res) {
    try {
        const resultado = await pagarSenaReservaCliente(req.body, req.usuario.id);

        if (!resultado.exitoso) {
            return res.status(400).json(resultado);
        }

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function obtenerMontoSenaReserva(req, res) {
    try {
        const resultado = await obtenerMontoSenaReservaCliente(req.body, req.usuario.id);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function obtenerMontoSenaTurno(req, res) {
    try {
        const resultado = await obtenerMontoSenaTurnoCliente(req.body);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function registrarSenaPresencial(req, res) {
    try {
        const resultado = await pagarSenaPresencial(req.body, req.usuario.id);

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function obtenerMontoSuscripcionMensual(req, res) {
    try {
        const resultado = await obtenerMontoSuscripcionMensualCliente(req.body, req.usuario.id);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function pagarSuscripcionMensual(req, res) {
    try {
        const resultado = await pagarSuscripcionMensualCliente(req.body, req.usuario.id);

        if (!resultado.exitoso) {
            return res.status(400).json(resultado);
        }

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function getDeudores(req, res) {
  try {
    const deudores = await pagoService.listarDeudores();
    
    return res.status(200).json({
      mensaje: 'Lista de pagos pendientes obtenida correctamente.',
      data: deudores
    });
  } catch (error) {
    console.error('Error al listar pagos pendientes:', error);
    return res.status(500).json({
      mensaje: 'Ocurrió un error interno al buscar los deudores.'
    });
  }
}

export async function aplicarCreditoUsuario(req, res) {
  try {
    const usuarioId = req.usuario.id; 
    // Recibimos los datos de la clase que el usuario quiere pagar
    const { reservaId, montoClase, tipoPago } = req.body;

    if (!reservaId || !montoClase) {
      return res.status(400).json({ 
        message: 'Faltan parámetros: se requiere la reserva y el valor de la clase.' 
      });
    }

    const resultado = await pagoService.procesarPagoConCredito({
      usuarioId,
      reservaId,
      montoClase,
      tipoPago
    });

    return res.status(200).json({
      mensaje: 'Operación realizada con éxito.',
      data: resultado
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Error interno al procesar el crédito.'
    });
  }
}


export async function getMovimientos(req, res) {
  try {
    const movimientos = await pagoService.listarMovimientos();
    
    return res.status(200).json({
      mensaje: 'Historial de movimientos obtenido correctamente.',
      data: movimientos
    });
  } catch (error) {
    console.error('Error al listar movimientos:', error);
    return res.status(500).json({
      mensaje: 'Ocurrió un error interno al procesar el listado de movimientos.'
    });
  }
}