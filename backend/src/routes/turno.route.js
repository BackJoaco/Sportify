import { Router } from 'express';

import * as turnoController from '../controllers/turnos.controller.js';

import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/listar', turnoController.getTurnos);
router.post('/crear', authMiddleware, esAdministrador, turnoController.create);
router.delete("/:id", authMiddleware, esAdministrador, turnoController.deleteTurno);
router.get("/:id", authMiddleware, turnoController.getTurnoById);
router.get("/:id/reservas/count", authMiddleware, turnoController.getReservasCount);
router.get("/:id/ocupacion", authMiddleware, turnoController.getOcupacion);
router.post("/:id/abonados", authMiddleware, turnoController.altaAbonado);
router.post("/:id/abonados/salir-cola", authMiddleware, turnoController.salirDeColaAbonado);
router.put('/modificar/:id', authMiddleware, esAdministrador, turnoController.modificarTurno);

export default router;
