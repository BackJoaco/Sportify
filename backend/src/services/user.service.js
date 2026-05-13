import * as userRepository from '../repositories/user.repository.js';

export function findByEmail(email) {
    return userRepository.findByEmail(email);
}

export function findByDni(dni) {
    return userRepository.findByDni(dni);
}

export function create(data) {
    return userRepository.create(data);
}
export function deleteUser(id) {
    return userRepository.deleteUser(id);
}
export async function getProfile(id) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    return {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        dni: user.dni,
        rol: user.rol
    };
}

