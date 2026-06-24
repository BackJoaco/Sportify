import "./RegisterEmployee.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { createEmployee } from "../../api/usuario.api.js";

export default function RegisterEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    email: "",
    dni: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      const message = "Las contraseñas no coinciden";
      setError(message);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    setLoading(true);

    try {
      await createEmployee(form);

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Empleado registrado exitosamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate("/usuarios");
      }, 2000);
    } catch (error) {
      const message = error.message || "Error inesperado";
      setError(message);
      setLoading(false);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }

  return (
    <main className="register-container">
      <section className="register-panel">
        <div className="panel-header">
          <h1>Registrar nuevo empleado</h1>
          <p>Completa los siguientes datos para registrar al empleado en el sistema.</p>
        </div>

        <div className="register-form-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="form-stack">
              <div className="form-group">
                <label>NOMBRE</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>APELLIDO</label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>FECHA DE NACIMIENTO</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CORREO ELECTRÓNICO</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CONTRASEÑA</label>
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>CONFIRMAR CONTRASEÑA</label>
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Guardando..." : "Guardar empleado"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
