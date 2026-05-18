import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { updateProfile } from "../../api/usuario.api";
import "./Profile.css";

export default function Profile() {
    const { usuario, setUsuario, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || "",
        apellido: usuario?.apellido || "",
        contrasena: "",
        confirmContrasena: "",
    });

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                contrasena: "",
                confirmContrasena: "",
            });
        }
    }, [usuario]);

    if (!usuario) return null;

    function handleLogout() {
        setShowLogoutConfirm(true);
    }

    async function confirmLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
            setShowLogoutConfirm(false);
        }
    }

    function cancelLogout() {
        setShowLogoutConfirm(false);
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const datosActualizar = {};
            
            if (formData.nombre.trim() && formData.nombre !== usuario.nombre) {
                datosActualizar.nombre = formData.nombre.trim();
            }
            
            if (formData.apellido.trim() && formData.apellido !== usuario.apellido) {
                datosActualizar.apellido = formData.apellido.trim();
            }
            
            if (formData.contrasena.trim()) {
                if (formData.contrasena !== formData.confirmContrasena) {
                    setLoading(false);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'error',
                        title: 'Las contraseñas no coinciden',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                    return;
                }
                datosActualizar.contrasena = formData.contrasena.trim();
            }

            if (Object.keys(datosActualizar).length === 0) {
                setLoading(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'No hay cambios para guardar',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
                return;
            }

            const usuarioActualizado = await updateProfile(datosActualizar);
            setUsuario(usuarioActualizado);
            setFormData({
                nombre: usuarioActualizado.nombre,
                apellido: usuarioActualizado.apellido,
                contrasena: "",
                confirmContrasena: "",
            });
            setIsEditing(false);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Datos actualizados exitosamente',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
        } catch (err) {
            setLoading(false);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: err.message || 'Error al actualizar los datos',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        setFormData({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            contrasena: "",
            confirmContrasena: "",
        });
        setIsEditing(false);
    }
    
    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>{isEditing ? "Modificar Perfil" : "Mi Perfil"}</h1>
                {!isEditing && <h2>¡Bienvenido, {usuario?.nombre}!</h2>}
                
                
                {!isEditing ? (
                    <>
                        <div className="profile-info">
                            <div className="info-item">
                                <label>Nombre</label>
                                <p>{usuario.nombre}</p>
                            </div>
                            
                            <div className="info-item">
                                <label>Apellido</label>
                                <p>{usuario.apellido}</p>
                            </div>
                            
                            <div className="info-item">
                                <label>Email</label>
                                <p>{usuario.email}</p>
                            </div>
                            
                            <div className="info-item">
                                <label>DNI</label>
                                <p>{usuario.dni}</p>
                            </div>
                            
                            <div className="info-item">
                                <label>Rol</label>
                                <p>{usuario.rol}</p>
                            </div>
                            
                            <div className="info-item">
                                <label>Estado</label>
                                <p>{usuario.estado}</p>
                            </div>
                        </div>
                        
                        <div className="profile-actions">
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                Editar perfil
                            </button>
                            <button className="btn-logout" onClick={handleLogout}>
                                Cerrar sesión
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contrasena">
                                Contraseña (déjalo en blanco para no cambiarla)
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="contrasena"
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleInputChange}
                                    placeholder="Mínimo 6 caracteres, 1 carácter especial"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmContrasena">Confirmar contraseña</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmContrasena"
                                    name="confirmContrasena"
                                    value={formData.confirmContrasena}
                                    onChange={handleInputChange}
                                    placeholder="Reingresá la contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button 
                                type="submit" 
                                className="btn-save"
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {showLogoutConfirm && (
                    <div className="confirm-modal">
                        <div className="confirm-dialog">
                            <p>¿Seguro que deseas cerrar sesión?</p>
                            <div className="confirm-actions">
                                <button type="button" className="btn-confirm-yes" onClick={confirmLogout}>
                                    Sí
                                </button>
                                <button type="button" className="btn-confirm-no" onClick={cancelLogout}>
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}