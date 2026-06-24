import * as actividadService from '../services/actividad.service.js';
import * as actividadFlow from '../flows/actividad/actividad.flow.js';

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
        const result = await actividadService.create(req.body);
        console.log(result);
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

export async function getActivityById(req, res) {
    try {
        const { id } = req.params;
        const actividad = await actividadService.getActividadById(id);
        return res.status(200).json(actividad);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}

export async function update(req, res) {
    try {
        const { id } = req.params;
        const updated = await actividadService.updateActivity(id, req.body);
        return res.status(200).json({ message: 'Actividad modificada correctamente', actividad: updated });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}