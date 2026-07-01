import * as estadisticaService from '../services/estadistica.service.js';

export async function getConcurrenciaPorActividad(req, res) {
  try {
    const estadisticas = await estadisticaService.calcularDiaMayorConcurrencia();
    
    return res.status(200).json({
      mensaje: 'Estadísticas de demanda de los últimos 30 días generadas correctamente.',
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    return res.status(500).json({ 
      mensaje: 'Ocurrió un error interno al procesar las estadísticas de concurrencia.' 
    });
  }
}