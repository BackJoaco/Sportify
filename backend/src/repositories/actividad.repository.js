import { Actividad } from '../models/index.model.js';

export async function create(data) {
    return Actividad.create(data);
}

export async function getActivities() {
    return Actividad.findAll();
}

export async function deleteActivity(id) {
    return Actividad.destroy({ where: { id } });
}

export async function getById(id){
    return Actividad.findByPk(id);
}