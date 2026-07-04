import * as devolucionService from '../services/devolucion.service.js';

export async function getDevoluciones(req, res) {
  try {
    const devoluciones = await devolucionService.listarDevolucionesPendientes();
    
    return res.status(200).json({
      mensaje: 'Lista de devoluciones pendientes obtenida correctamente.',
      data: devoluciones
    });
  } catch (error) {
    console.error('Error al listar devoluciones:', error);
    return res.status(500).json({
      mensaje: 'Ocurrió un error interno al procesar el listado de devoluciones.'
    });
  }
}