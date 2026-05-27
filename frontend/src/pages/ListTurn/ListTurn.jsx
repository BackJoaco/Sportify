import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { getTurnos } from "../../api/turno.api";
import "./ListTurn.css";

export default function ListTurnos() {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarTurnos();
    }, []);

    async function cargarTurnos() {
        try {
            setLoading(true);
            const data = await getTurnos();
            setTurnos(data);
        } catch (err) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: err.message || 'Error al cargar los turnos',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    }

    

    // Formatear la fecha para que se lea mejor (Opcional)
    const formatearFecha = (fecha) => {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="list-container">
            <div className="list-card">
                <div className="list-header">
                    <h1>Gestión de Turnos</h1>
                    <button 
                        className="btn-create" 
                        onClick={() => navigate("/turnos/crear")}
                    >
                        <FaPlus /> Nuevo Turno
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando turnos...</div>
                ) : turnos.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay turnos registrados en el sistema.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="turnos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Entrenador</th>
                                    <th>Fecha</th>
                                    <th>Hora de Inicio</th>
                                    <th>Cupo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {turnos.map((turno) => (
                                    <tr key={turno.id}>
                                        <td>#{turno.id}</td>
                                        <td className="fw-bold">{turno.entrenador}</td>
                                        <td>{formatearFecha(turno.fecha)}</td>
                                        <td>{turno.hora_inicio.substring(0, 5)} hs</td>
                                        <td>{turno.cupo_maximo} alumnos</td>
                                        <td className="actions-cell">
                                            <button 
                                                className="btn-icon edit" 
                                                title="Editar"
                                                onClick={() => navigate(`/turnos/editar/${turno.id}`)}
                                            >
                                                <FaEdit />
                                            </button>
                            
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