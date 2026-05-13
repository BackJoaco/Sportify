import { verifyToken } from '../utils/jwt.js';

export async function authMiddleware(req, res, next) {
    try {
        console.log('req.cookies:', req.cookies); // Agrega este log para verificar las cookies
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}