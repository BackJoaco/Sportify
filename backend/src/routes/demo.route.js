import { Router } from 'express';
import * as demoController from '../controllers/demo.controller.js';
import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

// Todos los endpoints de simulación requieren autenticación y rol ADMINISTRADOR
router.use(authMiddleware, esAdministrador);

// router.post('/dias-1-10', demoController.simularDias1a10);
// router.post('/dia-11', demoController.simularDia11);
// router.post('/forzar-cancelacion', demoController.forzarCancelacion);
router.post('/simular-expiracion', demoController.simularExpiracion);
// router.post('/alta-demanda', demoController.simularAltaDemanda);

export default router;
