import { Router } from 'express';
import { getMisCreditos } from '../controllers/credito.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; 

const router = Router();

// GET /api/creditos/historial
router.get('/historial', authMiddleware, getMisCreditos);

export default router;