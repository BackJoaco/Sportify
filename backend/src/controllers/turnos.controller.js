import * as turnosService from '../services/turno.service.js';
import * as turnoFlow from "../flows/turnos/turno.flow.js";

export async function getTurnos(req, res) {
    try {
        const turnos = await turnosService.getTurnos();
        return res.status(200).json(turnos);
    } catch (error) {
        return res.status(404).json({ message : error.message });
    }
}

export async function create(req, res) {
  try {
    // Le pasamos el body completo al flow
    const nuevoTurno = await turnoFlow.crearTurnoFlow(req.body);
    
    return res.status(201).json({ 
      message: "Turno creado exitosamente.", 
      turno: nuevoTurno 
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function deleteTurno(req, res) {
  try {
    const { id } = req.params;
    await turnosService.deleteTurno(id);
    
    return res.status(200).json({ message: "Turno eliminado exitosamente." });
  } catch (error) {
    // Si el error es por nuestras validaciones, mandamos un 400 (Bad Request)
    return res.status(400).json({ message: error.message });
  }
}

export async function getTurnoById(req, res) {
  try {
    const { id } = req.params;
    const turno = await turnosService.getTurnoById(id);
    
    return res.status(200).json(turno);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export async function getReservasCount(req, res) {
  try {
    const { id } = req.params;
    const count = await turnoFlow.getReservasCount(id);
    
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export async function modificarTurno(req, res) {
  try {
    const { id } = req.params;
    const datosNuevos = req.body;

    if (!datosNuevos || Object.keys(datosNuevos).length === 0) {
      return res.status(400).json({ mensaje: 'No se enviaron datos para actualizar.' });
    }

    // Ejecutamos el orquestador
    const resultado = await turnoFlow.modificarTurnoFlow(id, datosNuevos);

    // Armamos el mensaje dinámico para darle buen feedback al frontend
    let mensajeRespuesta = 'Turno modificado correctamente.';
    if (resultado.impacto && resultado.reservasCanceladas > 0) {
      mensajeRespuesta += ` Se dieron de baja ${resultado.reservasCanceladas} reservas asociadas debido a los cambios.`;
    }

    return res.status(200).json({
      mensaje: mensajeRespuesta,
      data: resultado.turno
    });

  } catch (error) {
    // Si tira error de "no existe", mandamos un 404, sino un 400 (Bad Request)
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({ mensaje: error.message });
  }
}