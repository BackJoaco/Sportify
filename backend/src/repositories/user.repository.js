import { User } from '../models/user.model.js';

/*
    Crear usuario en DB
*/
export const createUserRepository = async (userData) => {
    return await User.create(userData);
};

/*
    Buscar usuario por email
*/
export const findUserByEmailRepository = async (email) => {
    return await User.findOne({
        where: { email }
    });
};