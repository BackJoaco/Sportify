import { useState } from "react";
import { register } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import "./register.css";
import Swal from "sweetalert2";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    fecha_nacimiento: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      await register(form);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Registro exitoso. Serás redirigido al login",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {

      setLoading(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Error inesperado",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>

        <div className="input-group">
          <label>Nombre</label>

          <input
            placeholder="Ingresá tu nombre"
            required
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>Apellido</label>
          <input
            placeholder="Ingresá tu apellido"
            required
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            placeholder="Ingresá tu email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>DNI</label>
          <input
            type="number"
            placeholder="Ingresá tu DNI"
            required
            onChange={(e) => setForm({ ...form, dni: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            required
            onChange={(e) =>
              setForm({ ...form, fecha_nacimiento: e.target.value })
            }
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

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        {/* 👇 link a login */}
        <p className="register-footer">
          ¿Ya tenés cuenta?{" "}
          <span onClick={() => navigate("/login")}>
            Iniciar sesión
          </span>
        </p>
      </form>
    </div>
  );
}