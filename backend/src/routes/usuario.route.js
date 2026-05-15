import { Router } from 'express';

import * as usuarioController from '../controllers/usuario.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/perfil', authMiddleware, usuarioController.getProfile);


export default router;