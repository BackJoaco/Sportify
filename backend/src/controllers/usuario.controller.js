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

export async function getUsersExceptAdmins(req, res) {
    try {
        const usuarios = await usuarioService.getUsersExceptAdmins();
        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function registerEmployee(req, res) {
    try {
        const datos = req.body;
        const nuevo = await usuarioService.registerEmployee(datos);
        return res.status(201).json({ 
            message: 'Empleado registrado. Se envió un email para establecer la contraseña.',
            empleado: {
                id: nuevo.id,
                nombre: nuevo.nombre,
                apellido: nuevo.apellido,
                email: nuevo.email
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'El DNI o email ya está registrado' });
        }
        return res.status(400).json({ message: error.message });
    }
}

export async function deleteEmployee(req, res) {
    try {
        const { id } = req.params;
        await usuarioService.deleteEmployee(id);
        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function setContrasena(req, res) {
    try {
        const { token, password } = req.body;
        await usuarioService.setContrasena(token, password);
        return res.status(200).json({ message: 'Contraseña establecida correctamente. Ya podés iniciar sesión.' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function getEmployee(req, res) {
    try {
        const { id } = req.params;
        const empleado = await usuarioService.getEmployee(id);
        return res.status(200).json(empleado);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
export async function obtenerClientes(req, res) {
  try {
    const clientes = await usuarioService.getClientes();
    
    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({ 
      mensaje: error.message || 'Error interno al obtener los clientes' 
    });
  }
}