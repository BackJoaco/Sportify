import { Router } from 'express';
import { getConcurrenciaPorActividad } from '../controllers/estadistica.controller.js';
import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/estadisticas/concurrencia
router.get('/concurrencia', authMiddleware, esAdministrador, getConcurrenciaPorActividad);

export default router;