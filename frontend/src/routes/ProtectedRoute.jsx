import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ajustá la ruta de tu contexto

export default function ProtectedRoute({ children, allowedRoles }) {
  const { usuario } = useAuth();

  // Por seguridad, si no hay usuario cargado, lo mandamos al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario actual NO está en el arreglo de roles permitidos, lo pateamos al home
  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/home" replace />;
  }

  // Si el rol coincide, renderizamos la pantalla
  return children;
}