import * as turnosService
    from '../services/turno.service.js';
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
        await turnosService.create(req.body);
        console.log(req.body);
        return res.status(201).json({ message : 'Turno creado correctamente'});
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

export async function deleteTurno(req, res) {
  try {
    const { id } = req.params;
    await turnoService.deleteTurno(id);
    
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