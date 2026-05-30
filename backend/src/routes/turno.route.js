import { Router } from 'express';

import * as turnoController from '../controllers/turnos.controller.js';

import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/listar', turnoController.getTurnos);
router.post('/crear', turnoController.create);
router.delete("/:id", authMiddleware, esAdministrador, turnoController.deleteTurno);
router.get("/:id", authMiddleware, turnoController.getTurnoById);
router.get("/:id/reservas/count", authMiddleware, turnoController.getReservasCount);
router.put('/modificar/:id', authMiddleware, esAdministrador, turnoController.modificarTurno);

export default router;