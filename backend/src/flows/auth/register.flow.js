import bcrypt from 'bcrypt';

import * as usuarioService from '../../services/usuario.service.js';
import { sendWelcomeEmail } from '../../services/mail.service.js';

import { validateEmail, validatePassword, validateAdult } from '../../utils/validators.js';

export async function registerFlow(data) {
    validateEmail(data.email);
    if (!data.confirmPassword || data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
    }
    validatePassword(data.password);
    validateAdult(data.fecha_nacimiento);
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userData = {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email,
        fecha_nacimiento: data.fecha_nacimiento,
        contrasena: hashedPassword,
        rol: 'CLIENTE'
    };

    const existingUser = await usuarioService.findParanoidByEmailOrDni(data.email, data.dni);

    if (existingUser) {
        if (!existingUser.deletedAt) {
            if (existingUser.email === data.email) throw new Error('El email ya se encuentra registrado');
            if (existingUser.dni === data.dni) throw new Error('El DNI ya se encuentra registrado');
        }
        
        const usuario = await usuarioService.reactivateAndUpdate(existingUser.id, userData);
        return { usuario };
    }

    const usuario = await usuarioService.create(userData);
    return { usuario };
}
