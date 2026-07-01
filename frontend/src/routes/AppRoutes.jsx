import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import RegisterEmployee from "../pages/RegisterEmployee/RegisterEmployee";
import Home from "../pages/Home/Home";
import ListActivities from "../pages/ListActivities/ListActivities";
import CreateActivities from "../pages/CreateActivities/CreateActivities"
import NotFound from "../pages/NotFound/NotFound";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import CreateTurn from "../pages/CreateTurn/CreateTurn";
import ListTurn from "../pages/ListTurn/ListTurn";
import DetailTurn from "../pages/DetailTurn/DetailTurn";
import Reservation from "../pages/Reservation/Reservation";
import ProtectedRoute from "./ProtectedRoute";
import SetPassword from "../pages/SetPassword/SetPassword";
import UserManagement from "../pages/UserManagement/UserManagement";
import ModifyActivity from "../pages/ModifyActivity/ModifyActivity";
import Payments from "../pages/Payments/Payments";
import DemoPanel from "../pages/DemoPanel/DemoPanel";
import DemandaActividades from "../pages/Statistics/Statistics"; 

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
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <ListActivities />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/actividades/crear"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <CreateActivities />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/actividades/modificar/:id"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <ModifyActivity />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/turnos/crear"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <CreateTurn />
            </ProtectedRoute>
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

      <Route
        path="/reserva/mis-reservas"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["CLIENTE", "EMPLEADO"]}>
              <Reservation />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/pago/mis-pagos"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["CLIENTE"]}>
              <Payments />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <UserManagement />
          </PrivateRoute>
        }
      />

      <Route
        path="/demo-panel"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <DemoPanel />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/estadisticas/demanda"
        element={
          <PrivateRoute>
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <DemandaActividades />
            </ProtectedRoute>
          </PrivateRoute>
        }
      />

      {/* 404 - Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
