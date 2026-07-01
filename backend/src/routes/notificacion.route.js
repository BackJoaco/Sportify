import { Router } from 'express';
import * as notificacionController from '../controllers/notificacion.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/mis-notificaciones', authMiddleware, notificacionController.getMisNotificaciones);
router.patch('/:id/leida', authMiddleware, notificacionController.marcarComoLeida);
router.patch('/leidas/todas', authMiddleware, notificacionController.marcarTodasComoLeidas);
router.post('/procesar-recordatorios', authMiddleware, notificacionController.procesarRecordatoriosPago);

export default router;