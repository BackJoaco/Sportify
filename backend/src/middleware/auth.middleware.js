import { verifyToken } from '../utils/jwt.js';

export async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        const decoded = verifyToken(token);

        req.usuario = decoded;
        
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}