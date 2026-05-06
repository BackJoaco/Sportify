import {
    createUserRepository,
    findUserByEmailRepository
} from '../repositories/user.repository.js';

import {
    hashPassword,
    comparePassword
} from '../utils/bcrypt.js';

import { generateToken } from '../utils/jwt.js';

/*
    Registrar usuario
*/
export const registerUserService = async (userData) => {

    /*
        Verificar email existente
    */
    const existingUser = await findUserByEmailRepository(
        userData.email
    );

    if (existingUser) {
        throw new Error('El email ya se encuentra registrado');
    }

    /*
        Hashear contraseña
    */
    const hashedPassword = await hashPassword(
        userData.password
    );

    /*
        Reemplazar password plana
    */
    userData.password = hashedPassword;

    /*
        Guardar usuario
    */
    const user = await createUserRepository(
        userData
    );

    return user;
};

/*
    Login
*/
export const loginUserService = async (email, password) => {

    /*
        Buscar usuario
    */
    const user = await findUserByEmailRepository(email);

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    /*
        Verificar password
    */
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
    }

    /*
        Payload JWT
    */
    const payload = {
        id: user.id, email: user.email, rol: user.rol
    };

    /*
        Generar token
    */
    const token = generateToken(payload);
    return { user, token };
};