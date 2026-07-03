import { Router } from 'express';
import * as reservaController from '../controllers/reserva.controller.js';
import { authMiddleware, esAdministrador, esCliente, esEmpleado } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-reservas', authMiddleware, reservaController.getMisReservas);
router.get('/cliente-dni/:dni', authMiddleware, esEmpleado, reservaController.getReservasClientePorDni);
router.get('/cliente/:usuarioId', authMiddleware, esEmpleado, reservaController.getReservasCliente);
router.post('/crear', authMiddleware, esCliente, reservaController.create); //rehacer
router.patch("/:id/cancelar", authMiddleware, esCliente, reservaController.cancelarReserva); //corregir metodo asignar siguiente waitlist
router.post('/cola-no-abonados/salir', authMiddleware, esCliente, reservaController.salirDeColaNoAbonado); //revisar
router.post('/staff',authMiddleware, esEmpleado, reservaController.crearReservaPorEmpleado); 

export default router;
