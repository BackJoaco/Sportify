import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/*
    Hashear contraseña
*/
export const hashPassword = async (password) => {
    return await bcrypt.hash( password, SALT_ROUNDS);
};

/*
    Comparar contraseña plana con hash
*/
export const comparePassword = async (password,hashedPassword) => {
    return await bcrypt.compare(password,hashedPassword);
};