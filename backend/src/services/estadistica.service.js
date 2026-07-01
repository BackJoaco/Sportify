import * as estadisticaRepository from '../repositories/estadistica.repository.js';

export async function calcularDiaMayorConcurrencia() {
  const reservas = await estadisticaRepository.getConcurrenciaUltimos30Dias();

  // Diccionario para agrupar las reservas por actividad
  const demanda = {};

  // Inicializamos los días con el ENUM exacto de tu base de datos
  const diasBase = {
    LUNES: 0, MARTES: 0, MIERCOLES: 0, JUEVES: 0, VIERNES: 0, SABADO: 0, DOMINGO: 0
  };

  reservas.forEach(reserva => {
    const turno = reserva.Turno;
    const actividad = turno.Actividad;
    
    // Si la actividad no existe en el diccionario, la creamos
    if (!demanda[actividad.nombre]) {
      demanda[actividad.nombre] = {
        actividad_id: actividad.id,
        nombre: actividad.nombre,
        total_30_dias: 0,
        dias: { ...diasBase }
      };
    }

    // Sumamos 1 a la concurrencia total y 1 al día de la semana específico
    demanda[actividad.nombre].total_30_dias++;
    demanda[actividad.nombre].dias[turno.dia_semana]++;
  });

  // Transformamos el objeto en un array y calculamos el día de mayor demanda
  const resultado = Object.values(demanda).map(act => {
    let diaPico = 'SIN_DATOS';
    let maxReservas = 0;

    for (const [dia, cantidad] of Object.entries(act.dias)) {
      if (cantidad > maxReservas) {
        maxReservas = cantidad;
        diaPico = dia;
      }
    }

    return {
      ...act,
      dia_mayor_demanda: diaPico,
      reservas_dia_pico: maxReservas
    };
  });

  // Retornamos el array ordenado desde la actividad más demandada a la menos
  return resultado.sort((a, b) => b.total_30_dias - a.total_30_dias);
}