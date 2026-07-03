import { Router } from 'express';
import { getDevoluciones } from '../controllers/devolucion.controller.js';
import { authMiddleware, esAdministrador } from '../middleware/auth.middleware.js'; 

const router = Router();

// GET /api/devoluciones/pendientes
router.get('/pendientes', authMiddleware, esAdministrador, getDevoluciones);

export default router;