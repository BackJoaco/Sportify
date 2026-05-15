import jwt from 'jsonwebtoken';

function generateToken(usuario) {
    return jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export { generateToken, verifyToken };