import { Router } from 'express';

import * as actividadController from '../controllers/actividad.controller.js';

import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/listar', actividadController.getActivities);
router.post('/crear', actividadController.create);
router.delete('/eliminar/:id', actividadController.deleteActivity);

router.get('/:id', authMiddleware, esAdministrador, actividadController.getActivityById);
router.put('/:id', authMiddleware, esAdministrador, actividadController.update);

export default router;