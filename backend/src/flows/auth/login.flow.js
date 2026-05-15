import bcrypt from 'bcrypt';

import * as usuarioService from '../../services/usuario.service.js';
import * as authService from '../../services/auth.service.js';

export async function loginFlow(data) {

    const usuario = await usuarioService.findByEmail(data.email);

    if (!usuario) {
        throw new Error('Usuario o contraseña incorrectos');
    }

    const passwordValid = await bcrypt.compare(data.password, usuario.contrasena);

    if (!passwordValid) {
        throw new Error('Usuario o contraseña incorrectos');
    }

    const token = authService.generateToken(usuario);
    return { usuario, token };
}