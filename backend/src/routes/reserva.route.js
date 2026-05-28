import { Router } from 'express';

import * as reservaController from '../controllers/reserva.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-reservas', authMiddleware, reservaController.getMisReservas);

export default router;
