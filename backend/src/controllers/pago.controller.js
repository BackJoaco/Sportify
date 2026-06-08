import { pagarSenaPresencial, pagarSenaReservaCliente } from '../flows/payment/pago.flow.js';

export async function pagarSena(req, res) {
    try {
        const resultado = await pagarSenaReservaCliente(req.body, req.usuario.id);

        if (!resultado.exitoso) {
            return res.status(400).json(resultado);
        }

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function registrarSenaPresencial(req, res) {
    try {
        const resultado = await pagarSenaPresencial(req.body, req.usuario.id);

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
