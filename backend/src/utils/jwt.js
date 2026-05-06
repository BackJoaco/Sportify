import jwt from 'jsonwebtoken';

/*
    Generar token
*/
export const generateToken = (payload) => {
 return jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: '1h' });
};

/*
    Verificar token
*/
export const verifyToken = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET);
};