import bcrypt from 'bcrypt';

import * as usuarioService from '../../services/usuario.service.js';

import { validateEmail, validatePassword, validateAdult } from '../../utils/validators.js';

export async function registerFlow(data) {

    // 1. validaciones
    validateEmail(data.email);
    if (!data.confirmPassword || data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
    }
    validatePassword(data.password);
    validateAdult(data.fecha_nacimiento);
    
    // 2. verificar existencia
    const usuarioExists = await usuarioService.findByEmail(data.email);

    if (usuarioExists) {
        throw new Error('El email ya se encuentra registrado');
    }

    const dniExists = await usuarioService.findByDni(data.dni);

    if (dniExists) {
        throw new Error('El DNI ya se encuentra registrado');
    }

    // 3. hash password
    const hashedPassword =
        await bcrypt.hash(data.password, 10);

    // 4. crear usuario
    const usuario =
        await usuarioService.create({
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            email: data.email,
            fecha_nacimiento: data.fecha_nacimiento,
            contrasena: hashedPassword
        });

    return { usuario };
}