import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getConcurrenciaActividades } from "../../api/estadistica.api";
import "./Statistics.css"; // <-- Importamos el nuevo CSS

export default function DemandaActividades() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEstadisticas() {
      try {
        setLoading(true);
        const respuesta = await getConcurrenciaActividades();
        setEstadisticas(respuesta.data || []);
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al cargar las estadísticas",
          text: error.mensaje || "Ocurrió un problema de conexión.",
          showConfirmButton: false,
          timer: 3500,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEstadisticas();
  }, []);

  if (loading) {
    return <div className="home-container">Cargando reporte de concurrencia...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Reportes y Analíticas</span>
          <h1>Demanda por Actividad</h1>
          <p>Análisis de concurrencia de los últimos 30 días para optimizar horarios.</p>
        </div>
        
        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>

      <div className="home-layout stats-grid">
        
        {estadisticas.length === 0 ? (
          <div className="home-panel">
            <p>No hay datos de reservas registrados en los últimos 30 días.</p>
          </div>
        ) : (
          estadisticas.map((act) => (
            <div className="home-panel profile-panel" key={act.actividad_id}>
              
              <div className="stat-card-header">
                <h2>{act.nombre}</h2>
                <span className="stat-total">
                  {act.total_30_dias} <span className="stat-total-label">reservas/mes</span>
                </span>
              </div>
              
              <div className="data-grid" style={{ marginTop: "1rem" }}>
                <div>
                  <span>Día de mayor demanda</span>
                  <p className={act.dia_mayor_demanda !== "SIN_DATOS" ? "stat-value-peak" : "stat-value-empty"}>
                    {act.dia_mayor_demanda}
                  </p>
                </div>
                <div>
                  <span>Pico de reservas</span>
                  <p>{act.reservas_dia_pico} reservas</p>
                </div>
              </div>

              <div className="stat-breakdown-container">
                <span className="stat-breakdown-label">
                  Desglose semanal
                </span>
                <div className="stat-breakdown-badges">
                  {Object.entries(act.dias).map(([dia, cantidad]) => (
                    <div 
                      key={dia} 
                      className={`day-badge ${dia === act.dia_mayor_demanda ? "peak" : ""}`}
                      title={`${cantidad} reservas los ${dia.toLowerCase()}`}
                    >
                      {dia.substring(0, 3)}: {cantidad}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}