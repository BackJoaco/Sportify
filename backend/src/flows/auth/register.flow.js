import bcrypt from 'bcrypt';

import * as usuarioService from '../../services/usuario.service.js';
import * as authService from '../../services/auth.service.js';

import { validateEmail, validatePassword, validateAdult } from '../../utils/validators.js';

export async function registerFlow(data) {

    // 1. validaciones
    validateEmail(data.email);
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
            ...data,
            contrasena: hashedPassword
        });

    // 5. token
    const token =
        authService.generateToken(usuario);

    return { usuario: usuario, token };
}