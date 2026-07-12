import { Router } from 'express';

import * as pagoController from '../controllers/pago.controller.js';
import { authMiddleware, esCliente, esEmpleado, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-pagos', authMiddleware, esCliente, pagoController.getMisPagos);
router.post('/sena-reserva', authMiddleware, esCliente, pagoController.pagarSena);
router.post('/sena-reserva/monto', authMiddleware, esCliente, pagoController.obtenerMontoSenaReserva);
router.post('/sena-turno/monto', authMiddleware, esCliente, pagoController.obtenerMontoSenaTurno); //cambie de get a post
router.post('/suscripcion-mensual/monto', authMiddleware, esCliente, pagoController.obtenerMontoSuscripcionMensual);
router.post('/suscripcion-mensual', authMiddleware, esCliente, pagoController.pagarSuscripcionMensual);
router.post('/suscripcion-pendiente', authMiddleware, esCliente, pagoController.pagarSuscripcionPendiente);
router.post('/sena-presencial', authMiddleware, esEmpleado, pagoController.registrarSenaPresencial);
router.get('/pendientes', authMiddleware, esAdministrador, pagoController.getDeudores);
router.post('/aplicar-credito', authMiddleware, pagoController.aplicarCreditoUsuario);
router.get('/movimientos', authMiddleware, esAdministrador, pagoController.getMovimientos);

export default router;
