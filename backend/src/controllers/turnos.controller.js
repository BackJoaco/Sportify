import * as turnosService
    from '../services/turno.service.js';

export async function getTurnos(req, res) {
    try {
        const turnos = await turnosService.getTurnos();
        return res.status(200).json(turnos);
    } catch (error) {
        return res.status(404).json({ message : error.message });
    }
}

export async function create(req, res) {
    try {
        await turnosService.create(req.body);
        console.log(req.body);
        return res.status(201).json({ message : 'Turno creado correctamente'});
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}