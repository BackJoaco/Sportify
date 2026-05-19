import * as actividadService
    from '../services/actividad.service.js';

export async function getActivities(req, res) {
    try {
        const actividades = await actividadService.getActivities();
        return res.status(200).json(actividades);
    } catch (error) {
        return res.status(404).json({ message : error.message });
    }
}

export async function create(req, res) {
    try {
        await actividadService.create(req.body);
        return res.status(201).json({ message : 'Actividad creada correctamente'});
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}