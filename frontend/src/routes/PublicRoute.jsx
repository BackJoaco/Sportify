import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (usuario) {
    return <Navigate to="/perfil" replace />;
  }

  return children;
}