import { Router } from 'express';

import {registerUserController,loginUserController} from '../controllers/user.controller.js';

const router = Router();

/*
    Registro
*/
router.post('/register', registerUserController);

/*
    Login
*/
router.post('/login',loginUserController);

export default router;