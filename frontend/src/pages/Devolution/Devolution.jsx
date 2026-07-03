import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMoneyBillWave, FaUser, FaCalendarAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { getDevolucionesPendientes } from "../../api/devolucion.api.js";
import "./Devolution.css";

export default function DevolucionesPendientes() {
  const navigate = useNavigate();
  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDevoluciones() {
      try {
        setLoading(true);
        const respuesta = await getDevolucionesPendientes();
        setDevoluciones(respuesta.data || []);
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al cargar devoluciones",
          text: error.message || error.message || "No se pudo conectar con el servidor.",
          showConfirmButton: false,
          timer: 3500,
        });
      } finally {
        setLoading(false);
      }
    }

    cargarDevoluciones();
  }, []);

  const formatearFecha = (fechaString) => {
    const [year, month, day] = fechaString.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatearMonto = (monto) => {
    return Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  if (loading) {
    return <div className="home-container">Cargando lista de devoluciones...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Administración de Caja</span>
          <h1>Devoluciones Pendientes</h1>
          <p>Listado de usuarios no abonados que cancelaron su turno y requieren reembolso de dinero.</p>
        </div>
        
        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      <div className="home-layout singular-layout">
        <div className="home-panel">
          {devoluciones.length === 0 ? (
            <p className="no-data-text">No hay devoluciones de dinero pendientes de pago.</p>
          ) : (
            <div className="devoluciones-table-container">
              <table className="devoluciones-table">
                <thead>
                  <tr>
                    <th><FaUser /> Cliente</th>
                    <th>DNI</th>
                    <th><FaCalendarAlt /> Clase Cancelada</th>
                    <th>Pago Original</th>
                    <th><FaMoneyBillWave /> Total a Devolver</th>
                  </tr>
                </thead>
                <tbody>
                  {devoluciones.map((dev) => (
                    <tr key={dev.reserva_id}>
                      <td>
                        <div className="client-cell">
                          <strong>{dev.usuario.nombre}</strong>
                          <span>{dev.usuario.email}</span>
                        </div>
                      </td>
                      <td>{dev.usuario.dni}</td>
                      <td>
                        <div className="class-cell">
                          <strong>{dev.actividad}</strong>
                          <span>{formatearFecha(dev.fecha_clase)} - {dev.horario.substring(0, 5)} hs</span>
                        </div>
                      </td>
                      <td>
                        <span className={`method-badge ${dev.metodo_pago_original.toLowerCase()}`}>
                          {dev.metodo_pago_original === "MERCADO_PAGO" ? "Mercado Pago" : "Efectivo"}
                        </span>
                      </td>
                      <td className="monto-cell">
                        {formatearMonto(dev.monto_a_devolver)}
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