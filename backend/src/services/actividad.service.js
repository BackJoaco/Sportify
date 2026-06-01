import * as actividadRepository from '../repositories/actividad.repository.js';

export async function create(data) {
    const existing = await actividadRepository.getByNombre(data.nombre.trim());
    if (existing) {
        throw new Error('Ya existe una actividad con ese nombre');
    }
    
    return actividadRepository.create(data);
}

export async function getActivities(){
    return actividadRepository.getActivities();
}

export async function deleteActivityById(id) {
    return actividadRepository.deleteActivity(id);
}

export async function deleteActivity(id) {
    return actividadRepository.deleteActivity(id);
}

export async function getActividadById(id) {
  const actividad = await actividadRepository.getById(id);
  if (!actividad) {
    throw new Error("La actividad asignada no existe.");
  }
  return actividad;
}

export async function updateActivity(id, data) {
    const actividad = await actividadRepository.getById(id);
    if (!actividad) {
        throw new Error('La actividad no existe');
    }

    if (!data.nombre || data.nombre.trim() === '') {
        throw new Error('El nombre de la actividad es requerido');
    }

    if (isNaN(data.precio_clase) || parseFloat(data.precio_clase) <= 0) {
        throw new Error('El precio por clase debe ser un número positivo');
    }

    if (isNaN(data.precio_mensual) || parseFloat(data.precio_mensual) <= 0) {
        throw new Error('El precio mensual debe ser un número positivo');
    }

    const existing = await actividadRepository.getByNombre(data.nombre.trim());
    if (existing && existing.id !== Number(id)) {
        throw new Error('Ya existe una actividad con ese nombre');
    }

    return await actividadRepository.updateActivity(id, {
        nombre: data.nombre.trim(),
        precio_clase: parseFloat(data.precio_clase),
        precio_mensual: parseFloat(data.precio_mensual)
    });
}