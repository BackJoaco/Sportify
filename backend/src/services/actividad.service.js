import * as actividadRepository from '../repositories/actividad.repository.js';

export async function create(data) {
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