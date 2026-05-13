import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user,logout } = useAuth();
    const navigate = useNavigate();
    if (!user) return null;
    async function handleLogout() {
        await logout();
        navigate("/login");
    }
    return (
        <div>
            <h1>Perfil</h1>
            <h2>Bienvenido {user?.nombre}</h2>

            <p>Email: {user.email}</p>
            <p>DNI: {user.dni}</p>
            <button onClick={handleLogout}>
                Cerrar sesión
            </button>
        </div>
    );
}