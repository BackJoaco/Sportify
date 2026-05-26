import {Turno} from '../models/index.model.js';

export async function create(data) {
    return Turno.create(data);
}

export async function getTurnos() {
    return Turno.findAll();
}