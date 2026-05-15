import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta raíz */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas (solo si NO estás logueado) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Privada */}
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}