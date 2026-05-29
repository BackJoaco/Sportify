import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaCalendarCheck, FaHistory } from "react-icons/fa";
import { getMisReservas } from "../../api/reservas.api"; 
import "./Reservation.css";

export default function HistorialReservas() {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vistaActual, setVistaActual] = useState("vigentes"); 

    useEffect(() => {
        cargarHistorial();
    }, []);

    async function cargarHistorial() {
        try {
            setLoading(true);
            const data = await getMisReservas();
            
            // Ordenar por fecha (las más recientes primero)
            const reservasOrdenadas = (data || []).sort((a, b) => {
                const fechaA = new Date(`${a.Turno?.fecha}T${a.Turno?.hora_inicio}`);
                const fechaB = new Date(`${b.Turno?.fecha}T${b.Turno?.hora_inicio}`);
                return fechaA - fechaB; // Orden cronológico
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

    // Funciones de formateo 
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

    // Lógica para separar vigentes de anteriores
    const hoy = new Date();
    // Reseteamos la hora de 'hoy' a las 00:00 para comparar solo días, 
    // o podés dejarlo exacto si querés que los turnos de hace 2 horas pasen al historial.
    
    const reservasVigentes = reservas.filter(reserva => {
        if (reserva.estado !== "CONFIRMADA") return false;
        const fechaTurno = new Date(`${reserva.Turno?.fecha}T${reserva.Turno?.hora_inicio}`);
        return fechaTurno >= hoy;
    });

    const reservasAnteriores = reservas.filter(reserva => {
        const fechaTurno = new Date(`${reserva.Turno?.fecha}T${reserva.Turno?.hora_inicio}`);
        // Consideramos anteriores a las que ya pasaron, o las que fueron canceladas
        return fechaTurno < hoy || reserva.estado === "CANCELADA"; 
    });

    // Determinar qué lista mostrar según la pestaña activa
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