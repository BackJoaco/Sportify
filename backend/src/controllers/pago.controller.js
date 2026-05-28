import { pagarSenaReserva } from '../flows/payment/pago.flow.js';

export async function pagarSena(req, res) {
    try {
        const resultado = await pagarSenaReserva(req.body);

        if (!resultado.exitoso) {
            return res.status(400).json(resultado);
        }

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
