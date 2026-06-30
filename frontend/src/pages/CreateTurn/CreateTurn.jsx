import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createTurno } from "../../api/turno.api";
import "./CreateTurn.css";
import { getActividades } from "../../api/actividad.api";

export default function CreateTurno() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [actividades, setActividades] = useState([]);

  const [formData, setFormData] = useState({
    entrenador: "",
    dia_semana: "",
    hora_inicio: "",
    cupo_maximo: "",
    actividad_id: "",
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.dia_semana) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Selecciona el dia de la semana",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    setLoading(true);

    try {
      // Aseguramos que el cupo máximo se envíe como número
      const payload = {
        ...formData,
        cupo_maximo: parseInt(formData.cupo_maximo, 10),
        actividad_id: parseInt(formData.actividad_id, 10),
      };
      await createTurno(payload);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Turno creado exitosamente",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      // Redirigir a la lista de turnos (ajusta la ruta según tu proyecto)
      navigate("/turnos");
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Error al crear el turno",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/turnos"); // Vuelve atrás si cancela
  }

  useEffect(() => {
    async function cargarActividades() {
      try {
        const data = await getActividades();
        // El || [] evita errores si la API devuelve undefined o null
        setActividades(data || []);
      } catch (err) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: err.message || "Error al cargar las actividades",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        setActividades([]); // Asegurar array vacío en caso de error
      }
    }

    cargarActividades();
  }, []);

  return (
    <div className="turno-container">
      <div className="turno-card">
        <h1>Crear Nuevo Turno</h1>
        <p className="turno-subtitle">
          Completa los datos para asignar una nueva clase deportiva.
        </p>

        <form onSubmit={handleSubmit} className="turno-form">
          <div className="form-group">
            <label htmlFor="entrenador">Entrenador a cargo</label>
            <input
              type="text"
              id="entrenador"
              name="entrenador"
              value={formData.entrenador}
              onChange={handleInputChange}
              placeholder="Ej. Carlos Pérez"
              maxLength="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="actividad_id">Actividad</label>
            <select
              id="actividad_id"
              name="actividad_id"
              value={formData.actividad_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccioná una actividad...</option>
              {actividades.map((actividad) => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dia_semana">Dia de semana</label>
              <select
                id="dia_semana"
                name="dia_semana"
                value={formData.dia_semana}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un dia...</option>
                <option value="LUNES">Lunes</option>
                <option value="MARTES">Martes</option>
                <option value="MIERCOLES">Miercoles</option>
                <option value="JUEVES">Jueves</option>
                <option value="VIERNES">Viernes</option>
                <option value="SABADO">Sabado</option>
                <option value="DOMINGO">Domingo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hora_inicio">Hora de inicio</label>
              <select
                id="hora_inicio"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccioná una hora...</option>
                {Array.from({ length: 13 }, (_, i) => {
                  const hora = String(i + 8).padStart(2, "0");
                  return (
                    <option key={hora} value={`${hora}:00`}>
                      {hora}:00
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cupo_maximo">Cupo Máximo</label>
            <input
              type="number"
              id="cupo_maximo"
              name="cupo_maximo"
              value={formData.cupo_maximo}
              onChange={handleInputChange}
              min="1"
              max="100"
              placeholder="Cantidad de alumnos"
              required
            />
          </div>

          <div className="turno-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Guardando..." : "Crear Turno"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
