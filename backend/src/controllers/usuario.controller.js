import * as usuarioService
    from '../services/usuario.service.js';

export async function getProfile(req, res) {
    try {
        const { id } = req.usuario;
        const usuario = await usuarioService.getProfile(id);
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}

export async function updateProfile(req, res) {
    try {
        const { id } = req.usuario;
        const { nombre, apellido, contrasena } = req.body;

        const usuarioActualizado = await usuarioService.updateProfile(id, {
            nombre,
            apellido,
            contrasena
        });

        return res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}

