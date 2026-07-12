import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { verificarEmailRestablecer, cambiarContrasenaDirecto } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authMiddleware, authController.logout);
router.post('/verificar-email', verificarEmailRestablecer);
router.post('/cambiar-contrasena-directo', cambiarContrasenaDirecto);

export default router;

