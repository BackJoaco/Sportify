import bcrypt from 'bcrypt';

import * as userService from '../../services/user.service.js';
import * as authService from '../../services/auth.service.js';

import { validateEmail, validatePassword, validateAdult } from '../../utils/validators.js';

export async function registerFlow(data) {

    // 1. validaciones
    validateEmail(data.email);
    validatePassword(data.password);
    validateAdult(data.fecha_nacimiento);
    
    // 2. verificar existencia
    const userExists = await userService.findByEmail(data.email);

    if (userExists) {
        throw new Error('Email ya registrado');
    }

    const dniExists = await userService.findByDni(data.dni);

    if (dniExists) {
        throw new Error('DNI ya registrado');
    }

    // 3. hash password
    const hashedPassword =
        await bcrypt.hash(data.password, 10);

    // 4. crear usuario
    const user =
        await userService.create({
            ...data,
            password: hashedPassword
        });

    // 5. token
    const token =
        authService.generateToken(user);

    return { user, token };
}