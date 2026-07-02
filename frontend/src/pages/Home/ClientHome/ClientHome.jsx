import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMisReservas } from "../../../api/reservas.api";
import { getMisPagos, obtenerMontoSenaReserva, pagarSenaReserva } from "../../../api/pago.api";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaCreditCard,
  FaIdCard,
  FaUserEdit,
  FaWallet,
} from "react-icons/fa";
import Swal from "sweetalert2";
import PaymentModal from "../../../components/PaymentModal/PaymentModal";
import "./ClientHome.css";
import { getMisCreditos } from "../../../api/credito.api";

export default function ClientHome() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [reservasError, setReservasError] = useState("");
  const [pagosError, setPagosError] = useState("");
  const [reservaAPagar, setReservaAPagar] = useState(null);
  const [montoAPagar, setMontoAPagar] = useState(0);
  const [pagando, setPagando] = useState(false);
// Estados para Créditos (NUEVO)
  const [creditos, setCreditos] = useState([]);
  const [loadingCreditos, setLoadingCreditos] = useState(true);
  const [creditosError, setCreditosError] = useState("");


  async function cargarReservas() {
    try {
      setLoadingReservas(true);
      const data = await getMisReservas();
      setReservas(data || []);
      setReservasError("");
    } catch (err) {
      setReservas([]);
      setReservasError(err.message || "No se pudieron cargar las reservas");
    } finally {
      setLoadingReservas(false);
    }
  }

  async function cargarPagos() {
    try {
      setLoadingPagos(true);
      const data = await getMisPagos();
      setPagos(data || []);
      setPagosError("");
    } catch (err) {
      setPagos([]);
      setPagosError(err.message || "No se pudieron cargar los pagos");
    } finally {
      setLoadingPagos(false);
    }
  }

  // NUEVA FUNCIÓN: Cargar Créditos
  async function cargarCreditos() {
    try {
      setLoadingCreditos(true);
      const data = await getMisCreditos();
      // Si el backend devuelve { mensaje: "...", data: [...] }
      setCreditos(data.data || data || []);
      setCreditosError("");
    } catch (err) {
      setCreditos([]);
      setCreditosError(err.message || "No se pudieron cargar los créditos");
    } finally {
      setLoadingCreditos(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      cargarReservas();
      cargarPagos();
      cargarCreditos(); // Sumamos la llamada a la carga inicial
    });
  }, []);

  if (!usuario) return null;

  const reservasActivas = reservas.filter(
    (reserva) => reserva.estado === "CONFIRMADA"
  );

  const pagosPendientes = reservas.filter(
    (reserva) =>
      reserva.estado === "CONFIRMADA" && reserva.estado_pago === "PENDIENTE"
  );

  const pagosRecientes = pagos.slice(0, 3);

  // NUEVO: Filtros de Créditos
  const creditosDisponibles = creditos.filter((credito) => credito.estado === "DISPONIBLE");
  const creditosRecientes = creditos.slice(0, 3); // Mostramos solo los últimos 3 en el panel

  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatearHora(hora) {
    if (!hora) return "Sin horario";
    return `${hora.substring(0, 5)} hs`;
  }

  function mapEstadoPago(estadoPago) {
    const estados = {
      PENDIENTE: "Pendiente",
      SENA_ABONADA: "Seña abonada",
      PAGADO_COMPLETO: "Pagado completo",
    };

    return estados[estadoPago] || estadoPago;
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

  function formatearFechaCompleta(fecha) {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  async function abrirModalPago(reserva) {
    try {
      setPagando(true);
      const resultado = await obtenerMontoSenaReserva({ reservaId: reserva.id });

      setReservaAPagar(reserva);
      setMontoAPagar(Number(resultado.monto) || 0);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "No se pudo calcular el monto de la seña",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      setReservaAPagar(null);
      setMontoAPagar(0);
    } finally {
      setPagando(false);
    }
  }

  function cerrarModalPago() {
    if (!pagando) {
      setReservaAPagar(null);
      setMontoAPagar(0);
    }
  }

  async function handlePagarSena(tarjetaDebito) {
    if (!reservaAPagar) return;

    if (montoAPagar <= 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "No se pudo calcular el monto de la seña",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    setPagando(true);

    try {
      await pagarSenaReserva({
        reservaId: reservaAPagar.id,
        tarjetaDebito,
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Seña abonada correctamente",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      setReservaAPagar(null);
      await cargarReservas();
      await cargarPagos();
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al pagar la seña",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setPagando(false);
    }
  }

  const resumen = [
    {
      label: "Reservas activas",
      value: reservasActivas.length,
      icon: <FaCalendarCheck />,
    },
    {
      label: "Pagos pendientes",
      value: pagosPendientes.length,
      icon: <FaCreditCard />,
    },
    {
      label: "Creditos disponibles",
      value: creditosDisponibles.length, //Idealmente acá deberías llamar a un endpoint que cuente los créditos disponibles
      icon: <FaWallet />,
    },
  ];

  return (
    <main className="home-container">
      <section className="home-header">
        <div>
          <span className="home-kicker">Mi inicio</span>
          <h1>Hola, {usuario.nombre}</h1>
          <p>Desde aca vas a poder consultar tu actividad en el centro.</p>
        </div>

        <div className="home-header-actions">
          <button className="btn-primary" onClick={() => navigate("/turnos")}>
            <FaCalendarAlt /> Ver turnos
          </button>
          <button className="btn-secondary" onClick={() => navigate("/perfil")}>
            <FaUserEdit /> Editar perfil
          </button>
        </div>
      </section>

      <section className="home-summary-grid">
        {resumen.map((item) => (
          <article className="summary-card" key={item.label}>
            <div className="summary-icon">{item.icon}</div>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="home-layout">
        <article className="home-panel profile-panel">
          <div className="panel-title">
            <FaIdCard />
            <h2>Mis datos</h2>
          </div>

          <div className="data-grid">
            <div>
              <span>Nombre</span>
              <p>{usuario.nombre} {usuario.apellido}</p>
            </div>
            <div>
              <span>Email</span>
              <p>{usuario.email}</p>
            </div>
            <div>
              <span>DNI</span>
              <p>{usuario.dni}</p>
            </div>
            <div>
              <span>Estado</span>
              <p className="status-pill">{usuario.estado}</p>
            </div>
          </div>
        </article>

        <article className="home-panel">
          <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaCalendarCheck />
              <h2>Reservas activas</h2>
            </div>
            
            
            <button 
              className="btn-ver-mas" 
              onClick={() => navigate("/reserva/mis-reservas")}
            >
              Ver más
            </button>
          </div>

          {loadingReservas ? (
            <div className="empty-panel">
              <p>Cargando reservas...</p>
            </div>
          ) : reservasError ? (
            <div className="empty-panel">
              <p>{reservasError}</p>
            </div>
          ) : reservasActivas.length === 0 ? (
            <div className="empty-panel">
              <p>No tenes reservas activas registradas por el momento.</p>
            </div>
          ) : (
            <div className="reservation-list">
              {reservasActivas.map((reserva) => (
                <div className="reservation-item" key={reserva.id}>
                  <div>
                    <strong>
                      {reserva.Turno?.Actividad?.nombre || "Actividad"}
                    </strong>
                    <span>
                      {formatearFecha(reserva.fecha)} -{" "}
                      {formatearHora(reserva.Turno?.hora_inicio)}
                    </span>
                  </div>
                  <div className="reservation-meta">
                    <span>{reserva.tipo_reserva}</span>
                    <span>{mapEstadoPago(reserva.estado_pago)}</span>
                    {reserva.estado_pago === "PENDIENTE" && (
                      <button
                        className="btn-pay-reservation"
                        onClick={() => abrirModalPago(reserva)}
                      >
                        Pagar seña
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="home-panel">
          <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaCreditCard />
              <h2>Pagos</h2>
            </div>

            <button
              className="btn-ver-mas"
              onClick={() => navigate("/pago/mis-pagos")}
            >
              Ver mas
            </button>
          </div>

          {loadingPagos ? (
            <div className="empty-panel">
              <p>Cargando pagos...</p>
            </div>
          ) : pagosError ? (
            <div className="empty-panel">
              <p>{pagosError}</p>
            </div>
          ) : pagos.length === 0 ? (
            <div className="empty-panel">
              <p>No tenes pagos registrados por el momento.</p>
            </div>
          ) : (
            <div className="payment-history-list">
              {pagosRecientes.map((pago) => (
                <div className="payment-history-item" key={pago.id}>
                  <div>
                    <strong>{mapTipoPago(pago.tipo_pago)}</strong>
                    <span>
                      {pago.Reserva?.Turno?.Actividad?.nombre || "Pago registrado"}
                    </span>
                    {pago.Reserva?.Turno && (
                      <small>
                        {formatearFecha(pago.Reserva.fecha)} -{" "}
                        {formatearHora(pago.Reserva.Turno.hora_inicio)}
                      </small>
                    )}
                  </div>
                  <div className="payment-history-meta">
                    <strong>{formatearMonto(pago.monto)}</strong>
                    <span>{mapMetodoPago(pago.metodo_pago)}</span>
                    <small>{formatearFechaCompleta(pago.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        
        <article className="home-panel">
          <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaWallet />
              <h2>Mis Créditos</h2>
            </div>
            
            <button className="btn-ver-mas" onClick={() => navigate("/mis-creditos")}>
              Ver todos
            </button>
          </div>

          {loadingCreditos ? (
            <div className="empty-panel"><p>Cargando créditos...</p></div>
          ) : creditosError ? (
            <div className="empty-panel"><p>{creditosError}</p></div>
          ) : creditos.length === 0 ? (
            <div className="empty-panel"><p>No tenés créditos registrados en tu historial.</p></div>
          ) : (
            <div className="payment-history-list">
              {creditosRecientes.map((credito) => (
                <div className="payment-history-item" key={credito.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block' }}>Crédito #{credito.id}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                      Vence: {formatearFechaCompleta(credito.fecha_vencimiento)}
                    </span>
                  </div>
                  
                  <div className="payment-history-meta">
                    <span 
                      style={{
                        padding: "0.3rem 0.8rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        backgroundColor: credito.estado === 'DISPONIBLE' ? "#e8f5e9" : credito.estado === 'USADO' ? "#e3f2fd" : "#ffebee",
                        color: credito.estado === 'DISPONIBLE' ? "#2e7d32" : credito.estado === 'USADO' ? "#1565c0" : "#c62828",
                      }}
                    >
                      {credito.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

      </section>

      <PaymentModal
        open={Boolean(reservaAPagar)}
        title={reservaAPagar ? `Pagar seña - ${reservaAPagar.Turno?.Actividad?.nombre || "Reserva"}` : "Pagar seña"}
        subtitle={reservaAPagar ? `Clase del ${formatearFecha(reservaAPagar.fecha)}` : ""}
        amount={montoAPagar}
        amountLabel="Seña"
        confirmLabel="Pagar y reservar"
        onClose={cerrarModalPago}
        onSubmit={handlePagarSena}
        loading={pagando}
      />
    </main>
  );
}
