import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateProfile } from "../../api/usuario.api";
import "./Profile.css";

export default function Profile() {
    const { usuario, setUsuario, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || "",
        apellido: usuario?.apellido || "",
        contrasena: "",
    });

    if (!usuario) return null;

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
        setSuccess("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
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
                datosActualizar.contrasena = formData.contrasena.trim();
            }

            if (Object.keys(datosActualizar).length === 0) {
                setError("No hay cambios para guardar");
                setLoading(false);
                return;
            }

            const usuarioActualizado = await updateProfile(datosActualizar);
            setUsuario(usuarioActualizado);
            setSuccess("Datos actualizados exitosamente");
            setFormData({
                nombre: usuarioActualizado.nombre,
                apellido: usuarioActualizado.apellido,
                contrasena: "",
            });
            setIsEditing(false);

            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Error al actualizar los datos");
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        setFormData({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            contrasena: "",
        });
        setIsEditing(false);
        setError("");
        setSuccess("");
    }
    
    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>{isEditing ? "Modificar Perfil" : "Mi Perfil"}</h1>
                {!isEditing && <h2>¡Bienvenido, {usuario?.nombre}!</h2>}
                
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                
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
                            <input
                                type="password"
                                id="contrasena"
                                name="contrasena"
                                value={formData.contrasena}
                                onChange={handleInputChange}
                                placeholder="Mínimo 6 caracteres, 1 carácter especial"
                            />
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
            </div>
        </div>
    );
}