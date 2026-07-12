import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getMisCreditos } from "../../api/credito.api";
import "./SeeCredits.css";

export default function HistorialCreditos() {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreditos() {
      try {
        setLoading(true);
        const respuesta = await getMisCreditos();
        setCreditos(respuesta.data || []);
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al cargar el historial",
          text: error.mensaje || "Ocurrió un problema de conexión.",
          showConfirmButton: false,
          timer: 3500,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCreditos();
  }, []);

  // Función para formatear las fechas de "2026-07-01T22:23:12Z" a "01/07/2026"
  const formatearFecha = (fechaString) => {
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-AR', opciones);
  };

  if (loading) {
    return <div className="home-container">Cargando historial de créditos...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Mi Cuenta</span>
          <h1>Historial de Créditos</h1>
          <p>Revisá tus clases a favor, créditos usados y vencimientos.</p>
        </div>
        
        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>

      <div className="home-layout">
        <div className="home-panel profile-panel">
          {creditos.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--gray)", padding: "2rem" }}>
              No tenés créditos registrados en tu historial.
            </p>
          ) : (
            <div className="creditos-list">
              {creditos.map((credito) => (
                <div key={credito.id} className={`credito-card ${credito.estado.toLowerCase()}`}>
                  <div className="credito-info">
                    <strong>Crédito #{credito.id}</strong>
                    <span className="credito-fechas">
                      Obtenido: {formatearFecha(credito.fecha_obtencion)} | 
                      Vence: {formatearFecha(credito.fecha_vencimiento)}
                    </span>
                  </div>
                  
                  <div className="credito-status">
                    <span className={`status-badge badge-${credito.estado.toLowerCase()}`}>
                      {credito.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}