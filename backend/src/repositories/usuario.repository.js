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

export async function findByIdIncludingDeleted(id, options = {}) {
    return Usuario.findByPk(id, {
        paranoid: false,
        ...options
    });
}

export async function updateUsuario(id, data) {
    const usuario = await Usuario.findByPk(id);
    return usuario.update(data);
}

export async function findAllClientes() {
    return await Usuario.findAll({
        where: {
            rol: 'CLIENTE'
        },
        attributes: { exclude: ['contrasena', 'createdAt', 'updatedAt', 'deletedAt'] }
    });
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

export async function findParanoidByEmailOrDni(email, dni) {
    return Usuario.findOne({
        where: {
            [Op.or]: [{ email }, { dni }]
        },
        paranoid: false 
    });
}

export async function restore(id) {
    return Usuario.restore({ where: { id } });
}

export async function update(id, data) {
    await Usuario.update(data, { where: { id } });
    return Usuario.findByPk(id);
}

export async function deleteUsuarioInstance(usuario, transaction) {
    await usuario.destroy({ transaction });
    return 1;
}

export async function findAllAdmins() {
    return Usuario.findAll({
        where: {
            rol: 'ADMINISTRADOR'
        }
    });
}
