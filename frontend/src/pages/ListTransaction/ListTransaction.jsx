import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaFileInvoiceDollar, FaCalendarTimes, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import { getMovimientos } from "../../api/pago.api";
import "./ListTransaction.css"; 

export default function HistorialMovimientos() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarMovimientos() {
      try {
        setLoading(true);
        const respuesta = await getMovimientos();
        setMovimientos(respuesta.data || []);
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al cargar movimientos",
          text: error.message || "No se pudo conectar con el servidor.",
          showConfirmButton: false,
          timer: 3500,
        });
      } finally {
        setLoading(false);
      }
    }

    cargarMovimientos();
  }, []);

  const formatearFecha = (fechaString) => {
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

  const formatearTexto = (texto) => {
    if (!texto) return "-";
    return texto.replace(/_/g, " ");
  };

  if (loading) {
    return <div className="home-container">Cargando historial de movimientos...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Administración de Caja</span>
          <h1><FaHistory style={{ marginRight: "0.5rem" }}/> Historial de Movimientos</h1>
          <p>Registro contable general de pagos, abonos y devoluciones del centro.</p>
        </div>
        
        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      <div className="home-layout singular-layout">
        <div className="home-panel">
          {movimientos.length === 0 ? (
            <p className="no-data-text">No hay movimientos registrados en el sistema.</p>
          ) : (
            <div className="deudores-table-container">
              <table className="deudores-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th><FaUser /> Cliente</th>
                    <th><FaCalendarTimes /> Detalle de Clase</th>
                    <th>Concepto y Método</th>
                    <th>Estado</th>
                    <th><FaFileInvoiceDollar /> Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.movimiento_id}>
                      <td className="fecha-deuda">
                        {formatearFecha(movimiento.fecha_movimiento)}
                      </td>
                      <td>
                        <div className="client-cell">
                          <strong>{movimiento.usuario.nombre}</strong>
                          <span>{movimiento.usuario.dni}</span>
                        </div>
                      </td>
                      <td>
                        <div className="class-cell">
                          <strong>{movimiento.detalle_clase.actividad}</strong>
                          <span>{movimiento.detalle_clase.horario}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-start" }}>
                          <span className={`concepto-badge ${movimiento.tipo_movimiento.toLowerCase()}`}>
                            {formatearTexto(movimiento.tipo_movimiento)}
                          </span>
                          <span className="metodo-texto">
                            {formatearTexto(movimiento.metodo_pago)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`estado-badge ${movimiento.estado_pago.toLowerCase()}`}>
                          {movimiento.estado_pago}
                        </span>
                      </td>
                      <td className={`monto-deuda-cell ${movimiento.tipo_movimiento === 'DEVOLUCION_SENA' ? 'monto-negativo' : 'monto-positivo'}`}>
                        {movimiento.tipo_movimiento === 'DEVOLUCION_SENA' ? '-' : ''}{formatearMonto(movimiento.monto)}
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