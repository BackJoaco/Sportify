import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaIdCard, FaCalendarAlt, FaDumbbell, FaTools, FaUsers } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";

export default function AdminHome() {
  const navigate = useNavigate();
  const { usuario } = useAuth(); // Dependiendo de cómo manejes el estado global

  // Valores de ejemplo para mantener la estructura visual del grid de resumen
  const resumen = [
    { label: "Turnos Activos", value: "-", icon: <FaCalendarAlt /> },
    { label: "Actividades", value: "-", icon: <FaDumbbell /> },
    { label: "Usuarios", value: "-", icon: <FaIdCard /> },
  ];

  return (
    <main className="home-container">
      <section className="home-header">
        <div>
          <span className="home-kicker">Panel de Administrador</span>
          {/* Se usa el optional chaining (?.) por si la carga inicial de usuario demora */}
          <h1>Hola, {usuario?.nombre || "Administrador"}</h1>
          <p>Desde acá vas a poder gestionar las actividades, turnos y el centro.</p>
        </div>

        <div className="home-header-actions">
          <button className="btn-primary" onClick={() => navigate("/turnos")}>
            <FaCalendarAlt /> Calendario de Turnos
          </button>
          <button className="btn-primary" onClick={() => navigate("/actividades")}>
            <FaDumbbell /> Actividades
          </button>
          <button className="btn-secondary" onClick={() => navigate("/perfil")}>
            <FaUserEdit /> Editar perfil
          </button>
        </div>
      </section>

      <section className="home-summary-grid">
        {resumen.map((item) => (
          <article className="summary-card" key={item.label}>
            <div className="summary-icon">{item.icon}</div>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="home-layout">
        <article className="home-panel profile-panel">
          <div className="panel-title">
            <FaIdCard />
            <h2>Mis datos</h2>
          </div>

          <div className="data-grid">
            <div>
              <span>Nombre</span>
              <p>{usuario?.nombre} {usuario?.apellido}</p>
            </div>
            <div>
              <span>Email</span>
              <p>{usuario?.email}</p>
            </div>
            <div>
              <span>DNI</span>
              <p>{usuario?.dni}</p>
            </div>
            <div>
              <span>Rol</span>
              <p className="status-pill">{usuario?.rol}</p>
            </div>
          </div>
        </article>

        <article className="home-panel">
          <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaTools />
            <h2>Herramientas del rol</h2>
          </div>

          <div className="tools-container">
            <button className="btn-primary btn-tool" onClick={() => navigate("/usuarios")}>
              <FaUsers /> Gestionar Usuarios
            </button>
          </div>
        </article>
      </section >
    </main >
  );
}