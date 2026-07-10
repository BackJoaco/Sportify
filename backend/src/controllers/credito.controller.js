import * as creditoService from '../services/credito.service.js';

export async function getMisCreditos(req, res) {
  try {
    // Tomamos el ID del usuario logueado inyectado por el middleware de autenticación
    const usuarioId = req.usuario.id; 

    const historial = await creditoService.obtenerHistorial(usuarioId);
    
    return res.status(200).json({
      mensaje: 'Historial de créditos obtenido con éxito.',
      data: historial
    });
  } catch (error) {
    return res.status(500).json({ 
      mensaje: 'Ocurrió un error interno al buscar el historial de créditos.' 
    });
  }
}