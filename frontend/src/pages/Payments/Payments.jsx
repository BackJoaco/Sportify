import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileInvoiceDollar, FaCalendarTimes, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import { getMisPagos } from "../../api/pago.api";
import "../ListTransaction/ListTransaction.css"; 
import "./Payments.css";

export default function Payments() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPagos() {
      try {
        setLoading(true);
        const respuesta = await getMisPagos();
        setPagos(respuesta.data || []);
      } catch (err) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: err.message || "Error al cargar los pagos",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } finally {
        setLoading(false);
      }
    }
    cargarPagos();
  }, []);

  const formatearFechaCompleta = (fechaString) => {
    if (!fechaString) return "Sin fecha";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-AR", { 
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute:"2-digit" 
    });
  };

  const formatearMonto = (monto) => {
    return Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  // La magia para traducir los conceptos y poner la "ñ"
  const formatearConcepto = (concepto) => {
    if (!concepto) return "-";
    if (concepto === "SENA") return "Seña";
    if (concepto === "DEVOLUCION_SENA") return "Devolución de Seña";
    return concepto.replace(/_/g, " "); 
  };

  const formatearMetodo = (metodo) => {
    if (!metodo) return "-";
    return metodo.replace(/_/g, " ");
  };

  if (loading) {
    return <div className="home-container">Cargando mis pagos...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Mi Cuenta</span>
          <h1><FaHistory style={{ marginRight: "0.5rem" }}/> Mis Pagos</h1>
          <p>Historial detallado de todas tus transacciones, señas y abonos.</p>
        </div>
        
        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate("/home")}>
            <FaArrowLeft /> Volver al inicio
          </button>
        </div>
      </div>

      <div className="home-layout singular-layout">
        <div className="home-panel">
          {pagos.length === 0 ? (
            <p className="no-data-text">No tenés pagos registrados por el momento.</p>
          ) : (
            <div className="deudores-table-container">
              <table className="deudores-table">
                <thead>
                  <tr>
                    <th>Fecha de pago</th>
                    <th><FaCalendarTimes /> Detalle de Clase</th>
                    <th>Concepto y Método</th>
                    <th>Estado</th>
                    <th><FaFileInvoiceDollar /> Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.pago_id}>
                      <td className="fecha-deuda">
                        {formatearFechaCompleta(pago.fecha)}
                      </td>
                      <td>
                        <div className="class-cell">
                          <strong>{pago.clase.actividad}</strong>
                          <span>{pago.clase.horario}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-start" }}>
                          <span className={`concepto-badge ${pago.concepto.toLowerCase()}`}>
                            {formatearConcepto(pago.concepto)}
                          </span>
                          <span className="metodo-texto">
                            {formatearMetodo(pago.metodo_pago)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`estado-badge ${pago.estado.toLowerCase()}`}>
                          {pago.estado === "COMPLETADO" ? "Completado" : pago.estado === "PENDIENTE" ? "Pendiente" : "Rechazado"}
                        </span>
                      </td>
                      <td className={`monto-deuda-cell ${pago.concepto === 'DEVOLUCION_SENA' ? 'monto-positivo' : ''}`}>
                        {pago.concepto === 'DEVOLUCION_SENA' ? '+' : ''}{formatearMonto(pago.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}