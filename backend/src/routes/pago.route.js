import { Router } from 'express';

import * as pagoController from '../controllers/pago.controller.js';

const router = Router();

router.post('/sena-reserva', pagoController.pagarSena);

export default router;
