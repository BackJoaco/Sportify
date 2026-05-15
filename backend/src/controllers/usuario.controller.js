import * as usuarioService
    from '../services/usuario.service.js';

export async function getProfile(req, res) {
    try {
        const { id } = req.usuario;
        const usuario = await usuarioService.getProfile(id);
        return res.json(usuario);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}

