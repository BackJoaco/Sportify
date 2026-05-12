import { Router } from 'express';

import * as userController from '../controllers/user.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/perfil', authMiddleware, userController.getProfile);


export default router;