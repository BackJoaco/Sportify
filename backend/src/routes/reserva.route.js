import { Router } from 'express';
import * as reservaController from '../controllers/reserva.controller.js';
import { authMiddleware, esAdministrador, esCliente, esEmpleado } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-reservas', authMiddleware, reservaController.getMisReservas);
router.get('/cliente-dni/:dni', authMiddleware, esEmpleado, reservaController.getReservasClientePorDni);
router.get('/cliente/:usuarioId', authMiddleware, esEmpleado, reservaController.getReservasCliente);
router.post('/crear', authMiddleware, esCliente, reservaController.create);
router.post('/crear-con-credito', authMiddleware, esCliente, reservaController.crearConCredito);
router.patch("/:id/cancelar", authMiddleware, esCliente, reservaController.cancelarReserva);
router.post('/cola-no-abonados/salir', authMiddleware, esCliente, reservaController.salirDeColaNoAbonado);
router.post('/cola-no-abonados/ingresar', authMiddleware, esCliente, reservaController.ingresarColaNoAbonado);
router.post('/staff',authMiddleware, esEmpleado, reservaController.crearReservaPorEmpleado); 
router.post('/escanearQR', authMiddleware, esEmpleado, reservaController.escanearQR);

export default router;
