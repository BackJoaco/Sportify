import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckDouble } from "react-icons/fa";
import { updateProfile } from "../../api/usuario.api";
import { getMisNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from "../../api/notificacion.api";
import NotificationModal from "../../components/NotificationModal/NotificationModal";
import "./Profile.css";

export default function Profile() {
    const { usuario, setUsuario, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || "",
        apellido: usuario?.apellido || "",
        contrasena: "",
        confirmContrasena: "",
    });

    async function cargarNotificaciones() {
        try {
            const data = await getMisNotificaciones();
            setNotificaciones(data.notificaciones || []);
            setNoLeidas(data.no_leidas || 0);
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        }
    }

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    async function handleMarcarComoLeida(id) {
        try {
            await marcarComoLeida(id);
            setNotificaciones((prev) =>
                prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
            );
            setNoLeidas((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error al marcar como leída:", error);
        }
    }

    async function handleMarcarTodasComoLeidas() {
        try {
            await marcarTodasComoLeidas();
            setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
            setNoLeidas(0);
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error);
        }
    }

    async function handleVerNotificacion(notif) {
        setSelectedNotif(notif);
        setIsModalOpen(true);

        if (!notif.leida) {
            try {
                await marcarComoLeida(notif.id);
                setNotificaciones((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
                );
                setSelectedNotif((prev) => (prev ? { ...prev, leida: true } : null));
                setNoLeidas((prev) => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Error al marcar como leída al abrir modal:", error);
            }
        }
    }

    if (!usuario) return null;

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
                        position: "top-end",
                        icon: "error",
                        title: "Las contrasenas no coinciden",
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
                    position: "top-end",
                    icon: "error",
                    title: "No hay cambios para guardar",
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
                position: "top-end",
                icon: "success",
                title: "Datos actualizados exitosamente",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
        } catch (err) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: err.message || "Error al actualizar los datos",
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

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>{isEditing ? "Modificar Perfil" : "Mi Perfil"}</h1>
                {!isEditing && <h2>Bienvenido, {usuario?.nombre}</h2>}

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
                            <button className="btn-back" onClick={() => navigate("/home")}>
                                <FaArrowLeft /> Volver al home
                            </button>
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                Editar perfil
                            </button>
                            {usuario.rol === "ADMINISTRADOR" && (
                                <button
                                    className="btn-edit"
                                    onClick={() => navigate("/usuarios")}
                                >
                                    Ir al Panel Admin
                                </button>
                            )}
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
                                Contrasena (dejar en blanco para no cambiarla)
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="contrasena"
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleInputChange}
                                    placeholder="Minimo 6 caracteres, 1 caracter especial"
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
                            <label htmlFor="confirmContrasena">Confirmar contrasena</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmContrasena"
                                    name="confirmContrasena"
                                    value={formData.confirmContrasena}
                                    onChange={handleInputChange}
                                    placeholder="Reingresa la contrasena"
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
            </div>

            {!isEditing && (
                <div className="profile-card profile-notif-card">
                    <h1>Mis Notificaciones</h1>
                    
                    {notificaciones.length > 0 && noLeidas > 0 && (
                        <button
                            type="button"
                            className="btn-mark-all-profile"
                            onClick={handleMarcarTodasComoLeidas}
                        >
                            <FaCheckDouble /> Marcar todas como leídas
                        </button>
                    )}

                    <div className="profile-notif-list">
                        {notificaciones.length === 0 ? (
                            <p className="no-notif-text">No tienes notificaciones recibidas.</p>
                        ) : (
                            notificaciones.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`profile-notif-item ${
                                        notif.leida ? "leida" : "no-leida"
                                    }`}
                                    onClick={() => handleVerNotificacion(notif)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="notif-body">
                                        <p className="notif-msg">{notif.mensaje}</p>
                                        <span className="notif-time">
                                            {new Date(notif.createdAt).toLocaleString("es-AR", {
                                                day: "2-digit",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    {!notif.leida && (
                                        <button
                                            type="button"
                                            className="btn-mark-read-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarcarComoLeida(notif.id);
                                            }}
                                        >
                                            Marcar leída
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <NotificationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedNotif(null);
                }}
                notification={selectedNotif}
            />
        </div>
    );
}
