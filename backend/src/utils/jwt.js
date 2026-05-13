import jwt from 'jsonwebtoken';

function generateToken(user) {
    return jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export { generateToken, verifyToken };