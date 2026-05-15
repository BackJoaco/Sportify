import * as usuarioRepository from '../repositories/usuario.repository.js';

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

