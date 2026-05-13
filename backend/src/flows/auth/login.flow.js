import bcrypt from 'bcrypt';

import * as userService from '../../services/user.service.js';
import * as authService from '../../services/auth.service.js';

export async function loginFlow(data) {

    const user = await userService.findByEmail(data.email);

    if (!user) {
        throw new Error('Usuario o contraseña incorrectos');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);

    if (!passwordValid) {
        throw new Error('Usuario o contraseña incorrectos');
    }

    const token = authService.generateToken(user);
    return { user, token };
}