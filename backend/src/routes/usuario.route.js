import { Router } from 'express';

import * as usuarioController from '../controllers/usuario.controller.js';

import { authMiddleware, esEmpleado } from '../middleware/auth.middleware.js';



const router = Router();

router.get('/perfil', authMiddleware, usuarioController.getProfile);
router.put('/perfil', authMiddleware, usuarioController.updateProfile);
router.get('/clientes',authMiddleware, esEmpleado, usuarioController.obtenerClientes);

export default router;