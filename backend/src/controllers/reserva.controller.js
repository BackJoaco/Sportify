import * as reservaService from '../services/reserva.service.js';

export async function getMisReservas(req, res) {
    try {
        const { id } = req.usuario;
        const reservas = await reservaService.findByUsuarioId(id);

        return res.status(200).json(reservas);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
