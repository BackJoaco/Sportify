import { Router } from 'express';
import * as reservaController from '../controllers/reserva.controller.js';
import { authMiddleware, esAdministrador, esCliente, esEmpleado } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-reservas', authMiddleware, reservaController.getMisReservas);
router.post('/crear', authMiddleware, esCliente, reservaController.create);
router.post('/staff',authMiddleware, esEmpleado, reservaController.crearReservaPorEmpleado);

export default router;
