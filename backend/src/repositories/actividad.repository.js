import { Actividad } from '../models/index.model.js';

export async function create(data) {
    return Actividad.create(data);
}

export async function getActivities() {
    return Actividad.findAll();
}