import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaCalendarCheck, FaHistory } from "react-icons/fa";
// Importa la nueva función
import { getMisReservas, cancelarReserva } from "../../api/reservas.api"; 
import "./Reservation.css";

export default function HistorialReservas() {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vistaActual, setVistaActual] = useState("vigentes"); 

    async function cargarHistorial() {
        try {
            setLoading(true);
            const data = await getMisReservas();
            
            const reservasOrdenadas = (data || []).sort((a, b) => {
                const fechaA = new Date(`${a.Turno?.fecha}T${a.Turno?.hora_inicio}`);
                const fechaB = new Date(`${b.Turno?.fecha}T${b.Turno?.hora_inicio}`);
                return fechaA - fechaB;
            });
            
            setReservas(reservasOrdenadas);
        } catch (err) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: err.message || "Error al cargar el historial",
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
            cargarHistorial();
        });
    }, []);

    // --- NUEVA LÓGICA DE CANCELACIÓN ---
    async function handleCancelar(reserva) {
        const tieneSenaAbonada = reserva.estado_pago !== "PENDIENTE";

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: tieneSenaAbonada
                ? "Se evaluará el tiempo restante para determinar la devolución de tu seña."
                : "La reserva se cancelará y no hay pagos para devolver.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "var(--blue)",
            cancelButtonColor: "var(--gray)",
            confirmButtonText: "Sí, cancelar reserva",
            cancelButtonText: "Volver"
        });

        if (result.isConfirmed) {
            try {
                const response = await cancelarReserva(reserva.id);
                
                // Muestra el mensaje del backend que explica si se devuelve o no la seña
                Swal.fire({
                    title: "Reserva cancelada",
                    text: response.message,
                    icon: response.devuelveSena ? "success" : "info",
                    confirmButtonColor: "var(--blue)"
                });
                
                // Recargamos el historial para que pase a la pestaña de "Anteriores"
                cargarHistorial();
            } catch (err) {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "error",
                    title: err.message || "Error al cancelar",
                    showConfirmButton: false,
                    timer: 3500
                });
            }
        }
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

    function mapEstadoPago(estadoPago) {
        const estados = {
            PENDIENTE: "Pendiente",
            SENA_ABONADA: "Seña abonada",
            PAGADO_COMPLETO: "Pagado completo",
        };
        return estados[estadoPago] || estadoPago;
    }

    const hoy = new Date();
    
    const reservasVigentes = reservas.filter(reserva => {
        if (reserva.estado !== "CONFIRMADA") return false;
        const fechaTurno = new Date(`${reserva.Turno?.fecha}T${reserva.Turno?.hora_inicio}`);
        return fechaTurno >= hoy;
    });

    const reservasAnteriores = reservas.filter(reserva => {
        const fechaTurno = new Date(`${reserva.Turno?.fecha}T${reserva.Turno?.hora_inicio}`);
        return fechaTurno < hoy || reserva.estado === "CANCELADA"; 
    });

    const listaAMostrar = vistaActual === "vigentes" ? reservasVigentes : reservasAnteriores;

    return (
        <div className="historial-container">
            <div className="historial-card">
                <div className="historial-header">
                    <div className="header-title-group">
                        <button 
                            className="btn-back" 
                            onClick={() => navigate("/home")} 
                            title="Volver al inicio"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1>Mis Reservas</h1>
                            <p className="historial-subtitle">Consulta tu historial de actividades.</p>
                        </div>
                    </div>
                </div>

                <div className="historial-tabs">
                    <button 
                        className={`tab-btn ${vistaActual === "vigentes" ? "active" : ""}`}
                        onClick={() => setVistaActual("vigentes")}
                    >
                        <FaCalendarCheck /> Vigentes ({reservasVigentes.length})
                    </button>
                    <button 
                        className={`tab-btn ${vistaActual === "anteriores" ? "active" : ""}`}
                        onClick={() => setVistaActual("anteriores")}
                    >
                        <FaHistory /> Anteriores ({reservasAnteriores.length})
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando historial...</div>
                ) : listaAMostrar.length === 0 ? (
                    <div className="empty-state">
                        <p>No se encontraron reservas en esta categoría.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="historial-table">
                            <thead>
                                <tr>
                                    <th>Actividad</th>
                                    <th>Fecha y Hora</th>
                                    <th>Tipo de Reserva</th>
                                    <th>Estado de Pago</th>
                                    <th>Estado General</th>
                                    {/* Nueva columna que solo se muestra en vigentes */}
                                    {vistaActual === "vigentes" && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {listaAMostrar.map((reserva) => (
                                    <tr key={reserva.id} className={reserva.estado === "CANCELADA" ? "row-cancelled" : ""}>
                                        <td className="fw-bold text-blue">
                                            {reserva.Turno?.Actividad?.nombre || "Actividad"}
                                        </td>
                                        <td>
                                            <div className="fecha-hora-cell">
                                                <span>{formatearFecha(reserva.Turno?.fecha)}</span>
                                                <span className="hora-text">{formatearHora(reserva.Turno?.hora_inicio)}</span>
                                            </div>
                                        </td>
                                        <td>{reserva.tipo_reserva}</td>
                                        <td>
                                            <span className={`badge-pago ${reserva.estado_pago.toLowerCase()}`}>
                                                {mapEstadoPago(reserva.estado_pago)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge-estado ${reserva.estado.toLowerCase()}`}>
                                                {reserva.estado}
                                            </span>
                                        </td>
                                        {/* Botón de cancelar solo en la pestaña de vigentes */}
                                        {vistaActual === "vigentes" && (
                                            <td>
                                                <button 
                                                    className="btn-secondary" 
                                                    onClick={() => handleCancelar(reserva)}
                                                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", borderColor: "var(--gray)", color: "var(--gray)" }}
                                                >
                                                    Cancelar
                                                </button>
                                            </td>
                                        )}
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
