import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaFileInvoiceDollar, FaCalendarTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { getPagosPendientes } from "../../api/pago.api";
import "./ListDebtors.css";

export default function PagosPendientes() {
  const navigate = useNavigate();
  const [deudores, setDeudores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDeudores() {
      try {
        setLoading(true);
        const respuesta = await getPagosPendientes();
        setDeudores(respuesta.data || []);
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al cargar deudores",
          text: error.message || "No se pudo conectar con el servidor.",
          showConfirmButton: false,
          timer: 3500,
        });
      } finally {
        setLoading(false);
      }
    }

    cargarDeudores();
  }, []);

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-AR");
  };

  const formatearMonto = (monto) => {
    return Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  const formatearConcepto = (concepto) => {
    return concepto.replace(/_/g, " ");
  };

  if (loading) {
    return <div className="home-container">Cargando lista de deudores...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Administración de Caja</span>
          <h1>Pagos Pendientes</h1>
          <p>Listado de clientes con deudas activas por abonos mensuales o reservas.</p>
        </div>
        
        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      <div className="home-layout singular-layout">
        <div className="home-panel">
          {deudores.length === 0 ? (
            <p className="no-data-text">¡Excelente! No hay pagos pendientes en el sistema.</p>
          ) : (
            <div className="deudores-table-container">
              <table className="deudores-table">
                <thead>
                  <tr>
                    <th><FaUser /> Cliente</th>
                    <th>DNI</th>
                    <th><FaCalendarTimes /> Detalle de Clase</th>
                    <th>Concepto</th>
                    <th><FaFileInvoiceDollar /> Monto Adeudado</th>
                  </tr>
                </thead>
                <tbody>
                  {deudores.map((deuda) => (
                    <tr key={deuda.pago_id}>
                      <td>
                        <div className="client-cell">
                          <strong>{deuda.usuario.nombre}</strong>
                          <span>{deuda.usuario.email}</span>
                        </div>
                      </td>
                      <td>{deuda.usuario.dni}</td>
                      <td>
                        <div className="class-cell">
                          <strong>{deuda.clase.actividad}</strong>
                          <span>{deuda.clase.horario}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`concepto-badge ${deuda.concepto.toLowerCase()}`}>
                          {formatearConcepto(deuda.concepto)}
                        </span>
                        <div className="fecha-deuda">
                          Emitido: {formatearFecha(deuda.fecha_emision_deuda)}
                        </div>
                      </td>
                      <td className="monto-deuda-cell">
                        {formatearMonto(deuda.monto_adeudado)}
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