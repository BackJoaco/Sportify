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

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData = {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email,
        fecha_nacimiento: data.fecha_nacimiento,
        contrasena: hashedPassword,
        rol: 'EMPLEADO'
    };

    const existingUser = await usuarioService.findParanoidByEmailOrDni(data.email, data.dni);

    if (existingUser) {
        if (!existingUser.deletedAt) {
            if (existingUser.email === data.email) throw new Error('El email ya se encuentra registrado');
            if (existingUser.dni === data.dni) throw new Error('El DNI ya se encuentra registrado');
        }
        // Si existe y tiene deletedAt, lo reactivamos
        return usuarioService.reactivateAndUpdate(existingUser.id, userData);
    }

    return usuarioService.create(userData);
}
