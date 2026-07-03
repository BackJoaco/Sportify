/**
 * Mapeo de día de la semana (ENUM) a número de día en JavaScript
 * (0 = Domingo, 1 = Lunes, etc.)
 */
const DIAS_SEMANA_MAP = {
  'DOMINGO': 0,
  'LUNES': 1,
  'MARTES': 2,
  'MIERCOLES': 3,
  'JUEVES': 4,
  'VIERNES': 5,
  'SABADO': 6
};

/**
 * Obtiene todas las fechas de las clases restantes para un día de la semana
 * dentro del mes Sportify actual (del 11 de un mes al 10 del siguiente).
 * @param {string} diaSemana Enum del día de la semana ('LUNES', 'MARTES'...)
 * @returns {Array<string>} Arreglo de fechas en formato YYYY-MM-DD
 */
export function getRemainingClassesInSportifyMonth(diaSemana) {
  const targetDay = DIAS_SEMANA_MAP[diaSemana];
  if (targetDay === undefined) {
    throw new Error('Día de la semana inválido');
  }

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Determinar la fecha límite del ciclo actual de abonados
  let endCycleDate;
  if (day >= 11) {
    // Si estamos a día 11 o más, el ciclo cierra el 10 del mes SIGUIENTE
    endCycleDate = new Date(year, month + 1, 10, 23, 59, 59);
  } else {
    // Si estamos antes del día 11, el ciclo cierra el 10 del mes ACTUAL
    endCycleDate = new Date(year, month, 10, 23, 59, 59);
  }

  const remainingDates = [];
  
  // Empezar a iterar desde hoy a las 00:00
  let currentDate = new Date(year, month, day);

  while (currentDate <= endCycleDate) {
    if (currentDate.getDay() === targetDay) {
      // Formatear como YYYY-MM-DD
      const isoDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      remainingDates.push(isoDate);
    }
    // Sumar 1 día
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return remainingDates;
}

/**
 * Obtiene todas las fechas de las clases en el ciclo Sportify actual 
 * (del 11 al 10), tanto pasadas como futuras.
 */
export function getAllClassesInSportifyMonth(diaSemana) {
  const targetDay = DIAS_SEMANA_MAP[diaSemana];
  if (targetDay === undefined) {
    throw new Error('Día de la semana inválido');
  }

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  let startCycleDate;
  let endCycleDate;

  if (day >= 11) {
    startCycleDate = new Date(year, month, 11, 0, 0, 0);
    endCycleDate = new Date(year, month + 1, 10, 23, 59, 59);
  } else {
    startCycleDate = new Date(year, month - 1, 11, 0, 0, 0);
    endCycleDate = new Date(year, month, 10, 23, 59, 59);
  }

  const allDates = [];
  let currentDate = new Date(startCycleDate);

  while (currentDate <= endCycleDate) {
    if (currentDate.getDay() === targetDay) {
      const isoDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      allDates.push(isoDate);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allDates;
}
