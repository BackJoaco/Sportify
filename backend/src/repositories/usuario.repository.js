import { Usuario } from '../models/index.model.js';

export async function create(data) {
    return Usuario.create(data);
}

export async function findByEmail(email) {
    return Usuario.findOne({ where: { email } });
}

export async function findByDni(dni) {
    return Usuario.findOne({ where: { dni } });
}

export async function findById(id) {
    return Usuario.findByPk(id);
}

