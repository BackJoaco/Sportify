import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import AdminHome from "./AdminHome/AdminHome";
import ClientHome from "./ClientHome/ClientHome";
import EmployeeHome from "./EmployeeHome/EmployeeHome";
import "./Home.css";

export default function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!usuario) return null;

  async function confirmLogout() {
    await logout();
    navigate("/login");
  }

  function renderHomeByRole() {
    if (usuario.rol === "ADMINISTRADOR") {
      return <AdminHome />;
    }

    if (usuario.rol === "EMPLEADO") {
      return <EmployeeHome />;
    }

    return <ClientHome />;
  }

  return (
    <div className="home-shell">
      <nav className="home-navbar">
        <div className="home-navbar-brand">
          <strong>Sportify</strong>
          <span>{usuario.rol}</span>
        </div>

        <button
          className="home-logout-button"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <FaSignOutAlt /> Cerrar sesion
        </button>
      </nav>

      {renderHomeByRole()}

      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="logout-dialog">
            <h2>Cerrar sesion</h2>
            <p>Seguro que deseas cerrar sesion?</p>

            <div className="logout-actions">
              <button
                type="button"
                className="btn-logout-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-logout-confirm"
                onClick={confirmLogout}
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
