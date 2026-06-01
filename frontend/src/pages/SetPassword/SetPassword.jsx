import "./SetPassword.css";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setPassword } from "../../api/usuario.api.js";
import Swal from "sweetalert2";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPasswordValue] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <main className="register-container">
        <section className="register-panel">
          <div className="invalid-token">
            <h2>Enlace inválido</h2>
            <p>El enlace de activación no es válido o ya fue utilizado.</p>
          </div>
        </section>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      setError("La contraseña debe contener al menos 1 carácter especial (!@#$%^&*)");
      return;
    }

    try {
      setLoading(true);
      await setPassword(token, password);

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Contraseña establecida exitosamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setError(error.message || "Ocurrió un error, intentá de nuevo");
      setLoading(false);
    }
  }

  return (
    <main className="register-container">
      <section className="register-panel">
        <div className="panel-header">
          <h1>Establecer contraseña</h1>
          <p>Ingresá tu nueva contraseña para activar tu cuenta.</p>
        </div>
        <div className="register-form-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="form-stack">
              <div className="form-group">
                <label>NUEVA CONTRASEÑA</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres y 1 especial"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>CONFIRMAR CONTRASEÑA</label>
                <input
                  type="password"
                  name="confirmar"
                  placeholder="Repetí tu contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Guardando..." : "Confirmar contraseña"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}