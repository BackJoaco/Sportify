import { Router } from 'express';

import * as actividadController from '../controllers/actividad.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/listar', actividadController.getActivities);
router.post('/crear', actividadController.create);

export default router;