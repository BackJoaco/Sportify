import { registerUserService,loginUserService } from '../services/user.service.js';

/*
    Registro
*/
export const registerUserController = async (req,res) => {
    try {
        const user = await registerUserService(req.body);
        res.status(201).json({
            ok: true,
            message: 'Usuario registrado',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

/*
    Login
*/
export const loginUserController = async (req,res) => {
    try {
        const { email,password} = req.body;

        const result = await loginUserService( email, password );
        res.status(200).json({
            ok: true,
            message: 'Login exitoso',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};