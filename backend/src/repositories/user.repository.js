import { Usuario } from '../models/index.model.js';

export async function create(data) {
    return User.create(data);
}

export async function findByEmail(email) {
    return User.findOne({ where: { email } });
}

export async function findByDni(dni) {
    return User.findOne({ where: { dni } });
}

export async function findById(id) {
    return User.findByPk(id);
}

