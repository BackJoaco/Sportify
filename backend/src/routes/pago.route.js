import { Router } from 'express';

import * as pagoController from '../controllers/pago.controller.js';
import { authMiddleware, esCliente, esEmpleado } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/sena-reserva', authMiddleware, esCliente, pagoController.pagarSena);
router.post('/sena-presencial', authMiddleware, esEmpleado, pagoController.registrarSenaPresencial);

export default router;
