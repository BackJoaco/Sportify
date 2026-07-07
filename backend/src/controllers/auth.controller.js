import { registerFlow } from '../flows/auth/register.flow.js';
import { loginFlow } from '../flows/auth/login.flow.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import { Usuario } from '../models/index.model.js';
import bcrypt from 'bcrypt'; 
import { hashPassword } from '../utils/bcrypt.js'; 

export async function register(req, res) {
    try {
        await registerFlow(req.body);
        return res.status(201).json({ message: 'Registro exitoso' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function login(req, res) {
    try {
        const result = await loginFlow(req.body);

        setAuthCookie(res, result.token);
        return res.json({ message: 'Login exitoso' });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}

export async function logout(req, res) {

    clearAuthCookie(res);

    return res.json({ message: 'Logout exitoso' });
}

export async function verificarEmailRestablecer(req, res) {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No se encontró ningún usuario con ese correo.' });
    }

    return res.status(200).json({ mensaje: 'Correo válido.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al verificar el correo.' });
  }
}

export async function cambiarContrasenaDirecto(req, res) {
  try {
    const { email, nuevaContrasena } = req.body;

    if (!email || !nuevaContrasena) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
    }

    // 1. Validar requisitos de la contraseña (Mínimo 6 caracteres, 1 especial)
    const regexEspecial = /^(?=.*[!@#$%^&*.,+\-_]).{6,}$/;
    if (!regexEspecial.test(nuevaContrasena)) {
      return res.status(400).json({ 
        mensaje: 'La contraseña debe tener al menos 6 caracteres y 1 carácter especial (!@#$%^&*.,+-).' 
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // 2. Verificar que NO sea igual a la contraseña actual
    const esMismaContrasena = await bcrypt.compare(nuevaContrasena, usuario.contrasena);
    if (esMismaContrasena) {
      return res.status(400).json({ 
        mensaje: 'La nueva contraseña no puede ser igual a tu contraseña actual.' 
      });
    }

    // 3. Encriptar y guardar
    const nuevaContrasenaHasheada = await hashPassword(nuevaContrasena);
    await usuario.update({ contrasena: nuevaContrasenaHasheada });

    return res.status(200).json({ 
      mensaje: 'Contraseña actualizada con éxito. Ya podés iniciar sesión.' 
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}