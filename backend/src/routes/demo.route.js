import { Router } from 'express';
import * as demoController from '../controllers/demo.controller.js';
import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

// Todos los endpoints de simulación requieren autenticación y rol ADMINISTRADOR
router.use(authMiddleware, esAdministrador);

router.post('/forzar-cancelacion', demoController.forzarCancelacion);
router.post('/simular-expiracion', demoController.simularExpiracion);
router.post('/generar-credito-a-vencer', demoController.generarCreditoAVencer);
router.post('/expirar-credito', demoController.expirarCreditoDemo);
router.post('/reset-db', demoController.resetDatabase);

export default router;
