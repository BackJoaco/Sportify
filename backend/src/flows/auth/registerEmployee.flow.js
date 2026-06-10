import bcrypt from 'bcrypt';

import * as usuarioService from '../../services/usuario.service.js';
import { validateAdult, validateEmail, validatePassword } from '../../utils/validators.js';

export async function registerEmployeeFlow(data) {
    validateEmail(data.email);

    if (!data.confirmPassword || data.password !== data.confirmPassword) {
        throw new Error('Las contrasenas no coinciden.');
    }

    validatePassword(data.password);
    validateAdult(data.fecha_nacimiento, 'El empleado debe ser mayor de 18 años');

    const usuarioExists = await usuarioService.findByEmail(data.email);
    if (usuarioExists) {
        throw new Error('El email ya se encuentra registrado');
    }

    const dniExists = await usuarioService.findByDni(data.dni);
    if (dniExists) {
        throw new Error('El DNI ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return usuarioService.create({
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email,
        fecha_nacimiento: data.fecha_nacimiento,
        contrasena: hashedPassword,
        rol: 'EMPLEADO'
    });
}
