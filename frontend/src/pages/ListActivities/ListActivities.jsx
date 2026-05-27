import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getActividades } from "../../api/actividad.api";
import "./ListActivities.css";

export default function ListActivities() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      } finally {
        setLoading(false);
      }
    }

    cargarActividades();
  }, []);

  if (loading) {
    return <div className="loading-container">Cargando actividades...</div>;
  }

  return (
    <div className="list-activities-container">
      <div className="list-header">
        <h1>Actividades Deportivas</h1>
        <button
          className="btn-create"
          onClick={() => navigate("/actividades/crear")}
        >
          + Nueva Actividad
        </button>
      </div>

      {actividades.length === 0 ? (
        <p className="no-data">No hay actividades registradas.</p>
      ) : (
        <div className="activities-grid">
          {actividades.map((actividad) => (
            <div key={actividad.id} className="activity-card">
              <h3>{actividad.nombre}</h3>

              <div className="activity-details">
                <span className="badge">
                  Clase: $
                  {Number(actividad.precio_clase).toLocaleString("es-AR")}
                </span>
                <span className="badge">
                  Mes: $
                  {Number(actividad.precio_mensual).toLocaleString("es-AR")}
                </span>
              </div>

              <button
                className="btn-view"
                onClick={() => navigate(`/actividades/${actividad.id}`)}
              >
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
