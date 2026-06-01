import "./RegisterEmployee.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "../../api/usuario.api.js";
import Swal from "sweetalert2";

export default function RegisterEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    email: "",
    dni: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
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
      setError(error.message || "Ocurrió un error, intentá de nuevo");
      setLoading(false);
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
                    type="email"
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