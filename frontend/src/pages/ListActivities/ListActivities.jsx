import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { getActividades, deleteActividad } from "../../api/actividad.api"; // deleteActividad es el import asumido
import "./ListActivities.css";

export default function ListActivities() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function cargarActividades() {
    try {
      setLoading(true);
      const data = await getActividades();
      setActividades(data || []);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Error al cargar las actividades",
        showConfirmButton: false,
        timer: 3000,
      });
      setActividades([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarActividades();
  }, []);

  async function handleEliminar(id) {
    const result = await Swal.fire({
      title: "¿Eliminar actividad?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--blue)",
      cancelButtonColor: "var(--gray)",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await deleteActividad(id); // Llamada asumida a la API
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Actividad eliminada",
          showConfirmButton: false,
          timer: 2500
        });
        cargarActividades(); // Recargar la lista
      } catch (err) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: err.message || "Error al eliminar",
          showConfirmButton: false,
          timer: 3500
        });
      }
    }
  }

  if (loading) {
    return <div className="loading-container">Cargando actividades...</div>;
  }

  return (
    <div className="list-activities-container">
      <div className="list-header-top">
        <div className="header-title-group">
          <button 
            className="btn-back" 
            onClick={() => navigate("/home")} 
            title="Volver al inicio"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1>Actividades Deportivas</h1>
            <p className="list-subtitle">Gestión del catálogo de actividades del centro.</p>
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/actividades/crear")}
        >
          + Nueva Actividad
        </button>
      </div>

      {actividades.length === 0 ? (
        <div className="empty-panel">
          <p>No hay actividades registradas.</p>
        </div>
      ) : (
        <div className="activities-grid">
          {actividades.map((actividad) => (
            <div key={actividad.id} className="activity-card">
              <h3>{actividad.nombre}</h3>

              <div className="activity-details">
                <span className="badge">
                  Clase: ${Number(actividad.precio_clase).toLocaleString("es-AR")}
                </span>
                <span className="badge">
                  Mes: ${Number(actividad.precio_mensual).toLocaleString("es-AR")}
                </span>
              </div>

              <div className="activity-actions">
                <button
                  className="btn-secondary btn-action"
                  onClick={() => navigate(`/actividades/modificar/${actividad.id}`)}
                >
                  <FaEdit /> Modificar
                </button>
                <button
                  className="btn-secondary btn-action danger-outline"
                  onClick={() => handleEliminar(actividad.id)}
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}