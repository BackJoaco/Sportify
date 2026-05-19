import * as actividadRepository from '../repositories/actividad.repository.js';

export async function create(data) {
    return actividadRepository.create(data);
}

export async function getActivities(){
    return actividadRepository.getActivities();
}