import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCreditCard } from "react-icons/fa";
import Swal from "sweetalert2";
import { getMisPagos } from "../../api/pago.api";
import "./Payments.css";

export default function Payments() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargarPagos() {
    try {
      setLoading(true);
      const data = await getMisPagos();
      setPagos(data || []);
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

  useEffect(() => {
    Promise.resolve().then(() => {
      cargarPagos();
    });
  }, []);

  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatearHora(hora) {
    if (!hora) return "Sin horario";
    return `${hora.substring(0, 5)} hs`;
  }

  function formatearFechaCompleta(fecha) {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatearMonto(monto) {
    const montoNumerico = Number(monto);

    if (Number.isNaN(montoNumerico)) {
      return "$0";
    }

    return montoNumerico.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  }

  function mapTipoPago(tipoPago) {
    const tipos = {
      SENA: "Sena",
      RESTO_TURNO: "Resto del turno",
      CLASE_COMPLETA: "Clase completa",
      SUSCRIPCION_MENSUAL: "Suscripcion mensual",
    };

    return tipos[tipoPago] || tipoPago;
  }

  function mapMetodoPago(metodoPago) {
    const metodos = {
      MERCADO_PAGO: "Mercado Pago",
      EFECTIVO: "Efectivo",
    };

    return metodos[metodoPago] || metodoPago;
  }

  function mapEstadoPago(estado) {
    const estados = {
      COMPLETADO: "Completado",
      RECHAZADO: "Rechazado",
      PENDIENTE: "Pendiente",
    };

    return estados[estado] || estado;
  }

  return (
    <div className="payments-container">
      <div className="payments-card">
        <div className="payments-header">
          <div className="payments-title-group">
            <button
              className="btn-back"
              onClick={() => navigate("/home")}
              title="Volver al inicio"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1>Mis Pagos</h1>
              <p className="payments-subtitle">Consulta todos tus pagos registrados.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Cargando pagos...</div>
        ) : pagos.length === 0 ? (
          <div className="empty-state">
            <p>No tenes pagos registrados por el momento.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Pago</th>
                  <th>Actividad</th>
                  <th>Fecha del turno</th>
                  <th>Metodo</th>
                  <th>Estado</th>
                  <th>Fecha de pago</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td className="payment-type-cell">
                      <FaCreditCard />
                      <span>{mapTipoPago(pago.tipo_pago)}</span>
                    </td>
                    <td className="fw-bold text-blue">
                      {pago.Reserva?.Turno?.Actividad?.nombre || "Pago registrado"}
                    </td>
                    <td>
                      {pago.Reserva?.Turno ? (
                        <div className="payment-date-cell">
                          <span>{formatearFecha(pago.Reserva.fecha)}</span>
                          <span className="payment-hour-text">
                            {formatearHora(pago.Reserva.Turno.hora_inicio)}
                          </span>
                        </div>
                      ) : (
                        "Sin turno asociado"
                      )}
                    </td>
                    <td>{mapMetodoPago(pago.metodo_pago)}</td>
                    <td>
                      <span className={`badge-payment ${pago.estado.toLowerCase()}`}>
                        {mapEstadoPago(pago.estado)}
                      </span>
                    </td>
                    <td>{formatearFechaCompleta(pago.createdAt)}</td>
                    <td className="payment-amount">{formatearMonto(pago.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
