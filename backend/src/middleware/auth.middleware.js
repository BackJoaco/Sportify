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

export function esAdministrador(req, res, next) {
  if (req.usuario && req.usuario.rol === "ADMINISTRADOR") {
    return next();
  }
  return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Administrador." });
}

export function esCliente(req, res, next) {
  if (req.usuario && req.usuario.rol === "CLIENTE") {
    return next();
  }
  return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Cliente." });
}

export function esEmpleado(req, res, next) {
  if (req.usuario && req.usuario.rol === "EMPLEADO") {
    return next();
  }
  return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Empleado." });
}
