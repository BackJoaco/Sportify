import { Op } from 'sequelize';
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

export async function updateUsuario(id, data) {
    const usuario = await Usuario.findByPk(id);
    return usuario.update(data);
}

export async function findAllExceptAdmins() {
    return Usuario.findAll({
        where: {
            rol: { [Op.ne]: 'ADMINISTRADOR' }
        }
    });
}

export async function findByToken(token) {
    if (!token) {
        return null;
    }

    return await Usuario.findOne({
        where: {
            token_activacion: token,
            token_expiracion: {
                [Op.gt]: new Date()
            }
        }
    });
}

export async function deleteUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
        return null;
    }
    return await usuario.destroy();
}