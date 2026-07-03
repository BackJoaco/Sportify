import { Router } from 'express';

import * as pagoController from '../controllers/pago.controller.js';
import { authMiddleware, esCliente, esEmpleado } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-pagos', authMiddleware, esCliente, pagoController.getMisPagos);
router.post('/sena-reserva', authMiddleware, esCliente, pagoController.pagarSena);
router.get('/sena-reserva/monto', authMiddleware, esCliente, pagoController.obtenerMontoSenaReserva);
router.get('/sena-turno/monto', authMiddleware, esCliente, pagoController.obtenerMontoSenaTurno);
router.get('/suscripcion-mensual/monto', authMiddleware, esCliente, pagoController.obtenerMontoSuscripcionMensual); //REHACER COMPLETO
router.get('/suscripcion-mensual', authMiddleware, esCliente, pagoController.pagarSuscripcionMensual);
router.post('/sena-presencial', authMiddleware, esEmpleado, pagoController.registrarSenaPresencial);

export default router;
