import * as usuarioRepository from '../repositories/usuario.repository.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { validatePassword, validateEmail } from '../utils/validators.js';
import { registerFlow } from '../flows/auth/register.flow.js';
import { registerEmployeeFlow } from '../flows/auth/registerEmployee.flow.js';


export function findByEmail(email) {
    return usuarioRepository.findByEmail(email);
}

export function findByDni(dni) {
    return usuarioRepository.findByDni(dni);
}

export function create(data) {
    return usuarioRepository.create(data);
}

export async function deleteEmployee(id) {
    const usuario = await usuarioRepository.findById(id);

    if (!usuario) {
        throw new Error('Empleado no encontrado');
    }

    if (usuario.rol !== 'EMPLEADO') {
        throw new Error('El usuario no es un empleado');
    }

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

export async function registerEmployee(datosEmpleado) {
    return await registerEmployeeFlow(datosEmpleado);
}

export async function setContrasena(token, password) {
    if (!token) {
        throw new Error('Token no proporcionado');
    }

    const usuario = await usuarioRepository.findByToken(token);

    if (!usuario) {
        throw new Error('Token inválido o expirado');
    }

    validatePassword(password); 
    const hashedContrasena = await hashPassword(password); 
    await usuarioRepository.updateUsuario(usuario.id, {
        contrasena: hashedContrasena,
        token_activacion: null,
        token_expiracion: null
    });
}

export async function getUsersExceptAdmins() {
    return usuarioRepository.findAllExceptAdmins();
}

export async function getEmployee(id) {
    const empleado = await usuarioRepository.findById(id);

    if (!empleado || empleado.rol !== 'EMPLEADO') {
        throw new Error('Empleado no encontrado');
    }

    return {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        dni: empleado.dni,
        estado: empleado.estado
    };
}