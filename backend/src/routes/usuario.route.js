import { Router } from 'express';

import * as usuarioController from '../controllers/usuario.controller.js';

import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/perfil', authMiddleware, usuarioController.getProfile);
router.put('/perfil', authMiddleware, usuarioController.updateProfile);
router.get('/', authMiddleware, esAdministrador, usuarioController.getUsersExceptAdmins);
router.post('/empleados', authMiddleware, esAdministrador, usuarioController.registerEmployee);
router.delete('/empleados/:id', authMiddleware, esAdministrador, usuarioController.deleteEmployee);
router.post('/empleados/set-password', usuarioController.setContrasena); // 
router.get('/empleados/:id', authMiddleware, esAdministrador, usuarioController.getEmployee);


export default router;