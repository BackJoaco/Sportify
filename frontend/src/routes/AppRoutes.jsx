import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import RegisterEmployee from "../pages/RegisterEmployee/RegisterEmployee";
import Home from "../pages/Home/Home";
import AdminHome from "../pages/Home/AdminHome/AdminHome";
import ListActivities from "../pages/ListActivities/ListActivities";
import CreateActivities from "../pages/CreateActivities/CreateActivities"
import NotFound from "../pages/NotFound/NotFound";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import CreateTurn from "../pages/CreateTurn/CreateTurn";
import ListTurn from "../pages/ListTurn/ListTurn";
import DetailTurn from "../pages/DetailTurn/DetailTurn";
import SetPassword from "../pages/SetPassword/SetPassword";

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

      <Route path="/set-password" element={<SetPassword />} />

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
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/home"
        element={
          <PrivateRoute>
            <AdminHome />
          </PrivateRoute>
        }
      />

      <Route
        path="/empleados/registrar"
        element={
          <PrivateRoute>
            <RegisterEmployee />
          </PrivateRoute>
        }
      />
      <Route
        path="/actividades"
        element={
          <PrivateRoute>
            <ListActivities/>
          </PrivateRoute>
        }
      />
      <Route
        path="/actividades/crear"
        element={
          <PrivateRoute>
            <CreateActivities/>
          </PrivateRoute>
        }
      />

      <Route
        path="/turnos/crear"
        element={
          <PrivateRoute>
            <CreateTurn />
          </PrivateRoute>
        }
      />

      <Route
        path="/turnos"
        element={
          <PrivateRoute>
            <ListTurn />
          </PrivateRoute>
        }
      />

      <Route
        path="/turnos/:id"
        element={
          <PrivateRoute>
            <DetailTurn />
          </PrivateRoute>
        }
      />

      {/* 404 - Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
