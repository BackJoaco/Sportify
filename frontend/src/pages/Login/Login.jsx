import { useState } from "react";
import { login } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loadUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await login(form);
      await loadUser();
      navigate("/profile");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.message || "Error inesperado",
      });
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <div className="input-group">
          <label>Email</label>

          <input
            type="email"
            placeholder="Ingresá tu email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>

          <input
            type="password"
            placeholder="Ingresá tu contraseña"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button>Iniciar sesión</button>

        <p className="login-footer">
          ¿Aún no te registraste?{" "}
          <span onClick={() => navigate("/register")}>
            Crear cuenta
          </span>
        </p>
      </form>
    </div>
  );
}