import * as actividadService from '../services/actividad.service.js';
import * as actividadFlow from '../flows/actividad.flow.js';

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

export async function deleteActivity(req, res) {
    try {

        const { id } = req.params;

        await actividadFlow.deleteActivity(id);

        return res.status(200).json({
            message: 'Actividad eliminada correctamente'
        });

    } catch (error) {

        console.log(error);

        return res.status(400).json({
            message: error.message
        });
    }
}