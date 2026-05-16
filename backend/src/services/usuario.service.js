import * as usuarioRepository from '../repositories/usuario.repository.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { validatePassword } from '../utils/validators.js';

export function findByEmail(email) {
    return usuarioRepository.findByEmail(email);
}

export function findByDni(dni) {
    return usuarioRepository.findByDni(dni);
}

export function create(data) {
    return usuarioRepository.create(data);
}
export function deleteUsuario(id) {
    return usuarioRepository.deleteUsuario(id);
}

export async function getProfile(id) {
    const usuario = await usuarioRepository.findById(id);

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        dni: usuario.dni,
        rol: usuario.rol,
        estado: usuario.estado
    };
}

export async function updateProfile(id, data) {
    const usuario = await usuarioRepository.findById(id);

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    const updates = {};

    if (typeof data.nombre === 'string' && data.nombre.trim() !== '') {
        updates.nombre = data.nombre.trim();
    }

    if (typeof data.apellido === 'string' && data.apellido.trim() !== '') {
        updates.apellido = data.apellido.trim();
    }

    if (typeof data.contrasena === 'string' && data.contrasena.trim() !== '') {
        const newPassword = data.contrasena;

        try {
            const isSamePassword = await comparePassword(newPassword, usuario.contrasena);
            if (isSamePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la actual');
            }
        } catch (err) {
            if (err.message === 'La nueva contraseña no puede ser igual a la actual') {
                throw err;
            }
            throw new Error('Error al validar la contraseña');
        }

        validatePassword(newPassword);
        updates.contrasena = await hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 0) {
        throw new Error('No hay datos para actualizar');
    }

    const usuarioActualizado = await usuarioRepository.updateUsuario(id, updates);

    return {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        email: usuarioActualizado.email,
        dni: usuarioActualizado.dni,
        rol: usuarioActualizado.rol,
        estado: usuarioActualizado.estado
    };
}

