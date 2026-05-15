import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    
    if (!usuario) return null;
    
    async function handleLogout() {
        await logout();
        navigate("/login");
    }
    
    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>Mi Perfil</h1>
                {console.log("Usuario en Profile.jsx:", usuario)}
                <h2>¡Bienvenido, {usuario?.nombre}!</h2>
                
                <div className="profile-info">
                    <div className="info-item">
                        <label>Nombre</label>
                        <p>{usuario.nombre} {usuario.apellido}</p>
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
                    <button className="btn-logout" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}