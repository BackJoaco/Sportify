import { Reserva, Turno, Actividad } from '../models/index.model.js';
import { Op } from 'sequelize';

export async function getConcurrenciaUltimos30Dias() {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30);
  
  // Formateamos a YYYY-MM-DD para evitar problemas con la hora en campos DATE
  const fechaFiltro = fechaLimite.toISOString().split('T')[0];

  return await Reserva.findAll({
    where: {
      fecha: { [Op.gte]: fechaFiltro },
      estado: { [Op.in]: ['PRESENTE'] } 
    },
    include: [{
      model: Turno,
      required: true,
      attributes: ['dia_semana'],
      include: [{
        model: Actividad,
        attributes: ['id', 'nombre'],
        required: true
      }]
    }],
    attributes: ['id'] // Solo traemos el ID para no sobrecargar la memoria, nos importan los joins
  });
}