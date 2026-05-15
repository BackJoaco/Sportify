import { registerFlow } from '../flows/auth/register.flow.js';

import { loginFlow } from '../flows/auth/login.flow.js';

import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';

export async function register(req, res) {
    try {
        const result = await registerFlow(req.body);
        setAuthCookie(res, result.token);
        return res.status(201).json({ message: 'Registro exitoso' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function login(req, res) {
    try {
        const result = await loginFlow(req.body);

        setAuthCookie(res, result.token);
        return res.json({ message: 'Login exitoso' });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}

export async function logout(req, res) {

    clearAuthCookie(res);

    return res.json({ message: 'Logout exitoso' });
}