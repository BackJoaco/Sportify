import * as actividadService from '../../services/actividad.service.js';
import * as turnoService from '../../services/turno.service.js';

export async function deleteActivity(id) {

    const hasTurns = await turnoService.existsTurnByActivityId(id);

    if (hasTurns) {
        throw new Error('No se puede eliminar la actividad porque tiene turnos asociados');
    }

    await actividadService.deleteActivity(id);
}