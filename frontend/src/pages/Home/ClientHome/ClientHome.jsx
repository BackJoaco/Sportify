import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMisReservas } from "../../../api/reservas.api";
import { pagarSenaReserva } from "../../../api/pago.api";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaCreditCard,
  FaIdCard,
  FaUserEdit,
  FaWallet,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./ClientHome.css";

export default function ClientHome() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [reservasError, setReservasError] = useState("");
  const [reservaAPagar, setReservaAPagar] = useState(null);
  const [pagando, setPagando] = useState(false);
  const [tarjeta, setTarjeta] = useState({
    numero: "",
    nombre: "",
    apellido: "",
    vencimiento: "",
    cvv: "",
  });

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

  useEffect(() => {
    cargarReservas();
  }, []);

  if (!usuario) return null;

  const reservasActivas = reservas.filter(
    (reserva) => reserva.estado === "CONFIRMADA"
  );

  const pagosPendientes = reservas.filter(
    (reserva) =>
      reserva.estado === "CONFIRMADA" && reserva.estado_pago === "PENDIENTE"
  );

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

  function calcularSena(reserva) {
    const precioClase = Number(reserva?.Turno?.Actividad?.precio_clase);

    if (!precioClase || Number.isNaN(precioClase)) {
      return 0;
    }

    return precioClase * 0.5;
  }

  function abrirModalPago(reserva) {
    setReservaAPagar(reserva);
    setTarjeta({
      numero: "",
      nombre: "",
      apellido: "",
      vencimiento: "",
      cvv: "",
    });
  }

  function cerrarModalPago() {
    if (!pagando) {
      setReservaAPagar(null);
    }
  }

  function handleTarjetaChange(e) {
    const { name, value } = e.target;
    setTarjeta((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePagarSena(e) {
    e.preventDefault();

    if (!reservaAPagar) return;

    const monto = calcularSena(reservaAPagar);

    if (monto <= 0) {
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await pagarSenaReserva({
        reservaId: reservaAPagar.id,
        tarjetaDebito: tarjeta,
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
      value: "0",
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
            <FaCalendarAlt /> Calendario de Turnos
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
            
            {/* NUEVO BOTÓN VER MÁS */}
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
                      {formatearFecha(reserva.Turno?.fecha)} -{" "}
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
          <div className="panel-title">
            <FaCreditCard />
            <h2>Pagos</h2>
          </div>

          <div className="empty-panel">
            <p>No hay pagos pendientes para mostrar.</p>
          </div>
        </article>

        <article className="home-panel">
          <div className="panel-title">
            <FaWallet />
            <h2>Informacion asociada</h2>
          </div>

          <div className="info-list">
            <div>
              <span>Rol</span>
              <p>{usuario.rol}</p>
            </div>
            <div>
              <span>Creditos</span>
              <p>Sin creditos disponibles</p>
            </div>
            <div>
              <span>Asistencias</span>
              <p>Sin registros cargados</p>
            </div>
          </div>
        </article>
      </section>

      {reservaAPagar && (
        <div className="payment-modal">
          <div className="payment-dialog">
            <div className="payment-header">
              <div>
                <span>Pagar seña</span>
                <h2>{reservaAPagar.Turno?.Actividad?.nombre || "Reserva"}</h2>
              </div>
              <strong>
                ${calcularSena(reservaAPagar).toLocaleString("es-AR")}
              </strong>
            </div>

            <form className="payment-form" onSubmit={handlePagarSena}>
              <div className="form-group">
                <label htmlFor="numero">Numero de tarjeta</label>
                <input
                  id="numero"
                  name="numero"
                  value={tarjeta.numero}
                  onChange={handleTarjetaChange}
                  placeholder="0000 0000 0000 0000"
                  required
                />
              </div>

              <div className="payment-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={tarjeta.nombre}
                    onChange={handleTarjetaChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    name="apellido"
                    value={tarjeta.apellido}
                    onChange={handleTarjetaChange}
                    required
                  />
                </div>
              </div>

              <div className="payment-row">
                <div className="form-group">
                  <label htmlFor="vencimiento">Vencimiento</label>
                  <input
                    id="vencimiento"
                    name="vencimiento"
                    value={tarjeta.vencimiento}
                    onChange={handleTarjetaChange}
                    placeholder="MM/AA"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    name="cvv"
                    value={tarjeta.cvv}
                    onChange={handleTarjetaChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="payment-actions">
                <button
                  type="button"
                  className="btn-payment-cancel"
                  onClick={cerrarModalPago}
                  disabled={pagando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-payment-submit"
                  disabled={pagando}
                >
                  {pagando ? "Pagando..." : "Confirmar pago"}
                </button>
              </div>

              {pagando && (
                <div className="payment-processing">
                  <div className="payment-spinner" />
                  <p>Realizando pago...</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
