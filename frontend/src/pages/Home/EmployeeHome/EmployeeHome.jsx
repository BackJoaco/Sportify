import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaMoneyBillWave, FaQrcode } from "react-icons/fa";
import { registrarSenaPresencial } from "../../../api/pago.api";
import { getReservasClientePorDni, escanearQR } from "../../../api/reservas.api";
import QRScannerModal from "../../../components/QRScannerModal/QRScannerModal";
import "./EmployeeHome.css";

export default function EmployeeHome() {
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [registrandoId, setRegistrandoId] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanSuccess = async (codigo_qr) => {
    try {
      const response = await escanearQR({ codigo_qr });
      Swal.fire({
        icon: 'success',
        title: 'Asistencia Registrada',
        text: response.message || 'Presente marcado correctamente',
        timer: 3000,
        showConfirmButton: false
      });
      setIsScannerOpen(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al escanear',
        text: error.message || error.mensaje || 'Hubo un error al procesar el QR',
      });
    }
  };

  async function buscarReservasPorDni(e) {
    e?.preventDefault();

    const dniBuscado = dni.trim();

    if (!dniBuscado) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Ingresa un DNI para buscar",
        showConfirmButton: false,
        timer: 2500,
      });
    }

    try {
      setLoadingReservas(true);
      const data = await getReservasClientePorDni(dniBuscado);
      setCliente(data.cliente);
      setReservas(data.reservas || []);
    } catch (err) {
      setCliente(null);
      setReservas([]);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "No se encontraron reservas para ese DNI",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoadingReservas(false);
    }
  }

  function handleDniChange(e) {
    setDni(e.target.value);

    if (!e.target.value.trim()) {
      setCliente(null);
      setReservas([]);
    }
  }

  function calcularSena(reserva) {
    const precioClase = Number(reserva?.Turno?.Actividad?.precio_clase);

    if (!precioClase || Number.isNaN(precioClase)) {
      return 0;
    }

    return precioClase * 0.5;
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatearHora(hora) {
    if (!hora) return "Sin horario";
    return `${hora.substring(0, 5)} hs`;
  }

  async function handleRegistrarSena(reserva) {
    const monto = calcularSena(reserva);

    if (monto <= 0) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "No se pudo calcular el monto de la seña",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    const result = await Swal.fire({
      title: "Registrar seña presencial",
      text: `Vas a registrar un pago en efectivo por $${monto.toLocaleString("es-AR")}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--blue)",
      cancelButtonColor: "var(--gray)",
      confirmButtonText: "Registrar pago",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setRegistrandoId(reserva.id);
      const response = await registrarSenaPresencial({
        reservaId: reserva.id,
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: response.mensaje || "Seña registrada correctamente",
        showConfirmButton: false,
        timer: 2500,
      });

      await buscarReservasPorDni();
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "No se pudo registrar la seña",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setRegistrandoId(null);
    }
  }

  const reservasPendientes = reservas.filter(
    (reserva) => reserva.estado === "CONFIRMADA" && reserva.estado_pago === "PENDIENTE"
  );

  return (
    <main className="employee-home-container">
      <section className="employee-home-header">
        <div>
          <span>Panel de empleado</span>
          <h1>Panel principal</h1>
          <p>Desde acá vas a poder registrar pagos presenciales y escanear accesos.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => setIsScannerOpen(true)}>
            <FaQrcode /> Escanear QR
          </button>
          <button className="btn-primary" onClick={() => navigate("/turnos")}>
            <FaCalendarAlt /> Calendario de Turnos
          </button>
        </div>
      </section>

      <section className="employee-action-panel">
        <div className="employee-action-icon">
          <FaMoneyBillWave />
        </div>
        <div className="employee-action-content">
          <h2>Registrar seña presencial</h2>
          <p>Ingresa el DNI del cliente y registra la seña pendiente de su reserva.</p>

          <form className="employee-payment-form" onSubmit={buscarReservasPorDni}>
            <label htmlFor="dni">DNI del cliente</label>
            <div className="employee-search-row">
              <input
                id="dni"
                value={dni}
                onChange={handleDniChange}
                placeholder="Ingresa el DNI"
                inputMode="numeric"
              />
              <button className="btn-primary" type="submit" disabled={loadingReservas}>
                {loadingReservas ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>

          {cliente && (
            <div className="employee-client-result">
              <strong>{cliente.apellido}, {cliente.nombre}</strong>
              <span>DNI {cliente.dni}</span>
            </div>
          )}

          {loadingReservas ? (
            <div className="employee-empty-state">Cargando reservas...</div>
          ) : cliente && reservasPendientes.length === 0 ? (
            <div className="employee-empty-state">
              Este cliente no tiene señas pendientes.
            </div>
          ) : (
            <div className="employee-reservation-list">
              {reservasPendientes.map((reserva) => {
                const monto = calcularSena(reserva);

                return (
                  <div className="employee-reservation-item" key={reserva.id}>
                    <div>
                      <strong>{reserva.Turno?.Actividad?.nombre || "Actividad"}</strong>
                      <span>
                        {formatearFecha(reserva.fecha)} -{" "}
                        {formatearHora(reserva.Turno?.hora_inicio)}
                      </span>
                    </div>
                    <div className="employee-reservation-action">
                      <span>${monto.toLocaleString("es-AR")}</span>
                      <button
                        className="btn-primary"
                        onClick={() => handleRegistrarSena(reserva)}
                        disabled={registrandoId === reserva.id || monto <= 0}
                      >
                        {registrandoId === reserva.id ? "Registrando..." : "Registrar seña"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <QRScannerModal 
        open={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />
    </main>
  );
}
