import * as usuarioService from '../../services/usuario.service.js';
import { validateEmail } from '../../utils/validators.js';
import { generarToken, generarExpiracion } from '../../utils/generarToken.js';
import { enviarEmailActivacion } from '../../services/email.service.js';

export async function registerEmployeeFlow(data) {

    // 1. validaciones
    validateEmail(data.email);

    // 2. verificar existencia
    const usuarioExists = await usuarioService.findByEmail(data.email);
    if (usuarioExists) {
        throw new Error('El email ya se encuentra registrado');
    }

    const dniExists = await usuarioService.findByDni(data.dni);
    if (dniExists) {
        throw new Error('El DNI ya se encuentra registrado');
    }

    // 3. generar token
    const token = generarToken();
    const expiracion = generarExpiracion();

    // 4. crear usuario sin contraseña
    const usuario = await usuarioService.create({
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email,
        contrasena: null,
        rol: 'EMPLEADO',
        token_activacion: token,
        token_expiracion: expiracion
    });

    // 5. mandar email
    await enviarEmailActivacion(data.email, token);

    return usuario;
}