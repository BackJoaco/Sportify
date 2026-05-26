import { Router } from 'express';

import * as turnoController from '../controllers/turnos.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/listar', turnoController.getTurnos);
router.post('/crear', turnoController.create);

export default router;