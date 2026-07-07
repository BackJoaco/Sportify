import { useState } from "react";
import { login, verificarEmail, restablecerContrasena } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loadUsuario } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [vista, setVista] = useState("LOGIN"); // "LOGIN" | "PEDIR_MAIL" | "NUEVA_CONTRASENA"
  const [emailRecuperacion, setEmailRecuperacion] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await login(form);
      await loadUsuario();
      navigate("/home");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.message || "Error inesperado",
      });
    }
  }

  async function handleVerificarMail(e) {
    e.preventDefault();
    if (!emailRecuperacion) return;
    
    try {
      setLoading(true);
      await verificarEmail(emailRecuperacion);
      // Si todo sale bien, pasamos a la pantalla de escribir la clave
      setVista("NUEVA_CONTRASENA");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Correo no encontrado",
        text: err.mensaje || "Verificá que el correo esté bien escrito.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarContrasena(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await restablecerContrasena(emailRecuperacion, nuevaContrasena);
      
      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: "Tu contraseña fue actualizada. Ya podés iniciar sesión.",
        confirmButtonColor: "#1E5BF0",
      });
      
      // Limpiamos los campos y volvemos al login normal
      setEmailRecuperacion("");
      setNuevaContrasena("");
      setVista("LOGIN");
    } catch (err) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: err.mensaje || "No se pudo cambiar la contraseña.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      
      {/* VISTA 1: LOGIN ORIGINAL */}
      {vista === "LOGIN" && (
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          
          <div className="input-group">
            <label>Email</label>
            <input
              value={form.email}
              placeholder="Ingresá tu email"
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresá tu contraseña"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {/* Link para recuperar contraseña */}
            <span 
              style={{ fontSize: "0.8rem", color: "#1E5BF0", cursor: "pointer", marginTop: "0.5rem", display: "inline-block" }}
              onClick={() => setVista("PEDIR_MAIL")}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <button>Iniciar sesión</button>

          <p className="login-footer">
            ¿Aún no te registraste?{" "}
            <span onClick={() => navigate("/register")}>
              Crear cuenta
            </span>
          </p>
        </form>
      )}

      {/* VISTA 2: PEDIR MAIL DE RECUPERACIÓN */}
      {vista === "PEDIR_MAIL" && (
        <form className="login-form" onSubmit={handleVerificarMail}>
          <h2>Recuperar contraseña</h2>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
            Ingresá el email con el que te registraste para validar tu identidad.
          </p>
          
          <div className="input-group">
            <label>Email de tu cuenta</label>
            <input
              type="email"
              value={emailRecuperacion}
              placeholder="Ej: tu@email.com"
              required
              onChange={(e) => setEmailRecuperacion(e.target.value)}
            />
          </div>

          <button disabled={loading}>
            {loading ? "Verificando..." : "Siguiente"}
          </button>

          <p className="login-footer">
            <span onClick={() => setVista("LOGIN")}>
              Volver al inicio de sesión
            </span>
          </p>
        </form>
      )}

      {/* VISTA 3: INGRESAR NUEVA CONTRASEÑA */}
      {vista === "NUEVA_CONTRASENA" && (
        <form className="login-form" onSubmit={handleCambiarContrasena}>
          <h2>Crear nueva clave</h2>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
            Debe tener mínimo 6 caracteres y al menos 1 carácter especial (!@#$...).
          </p>
          
          <div className="input-group">
            <label>Nueva contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresá tu nueva clave"
                required
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button disabled={loading}>
            {loading ? "Guardando..." : "Restablecer contraseña"}
          </button>

          <p className="login-footer">
            <span onClick={() => setVista("LOGIN")}>
              Cancelar
            </span>
          </p>
        </form>
      )}

    </div>
  );
}
