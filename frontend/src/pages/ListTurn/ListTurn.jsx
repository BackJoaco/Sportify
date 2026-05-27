import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getTurnos } from "../../api/turno.api";
import "./ListTurn.css";

const COLORES_ACTIVIDADES = [
    "#1E5BF0", // Blue
    "#2ECC71", // Green
    "#E74C3C", // Red
    "#F39C12", // Orange
    "#9B59B6", // Purple
    "#00D2FF", // Cyan
    "#E67E22", // Dark Orange
    "#16A085", // Teal
];

export default function CalendarioTurnos() {
    const navigate = useNavigate();
    const [turnos, setTurnos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [filtroActividad, setFiltroActividad] = useState("");
    const [loading, setLoading] = useState(true);

    const [fechaInicioSemana, setFechaInicioSemana] = useState(obtenerLunes(new Date()));

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {
        try {
            setLoading(true);
            const turnosData = await getTurnos();
            console.log("🔴 RAW DATA DESDE LA API:", turnosData);
            setTurnos(turnosData);

            const actividadesUnicas = [];
            const idsVistos = new Set();

            turnosData.forEach(turno => {
                const id = turno.actividad_id || turno.ActividadId;
                // Si el backend trae el modelo relacionado, usamos su nombre. Si no, un genérico.
                const nombre = turno.Actividad?.nombre || `Actividad ${id}`;

                if (id && !idsVistos.has(id)) {
                    idsVistos.add(id);
                    actividadesUnicas.push({ id, nombre });
                }
            });
            
            setActividades(actividadesUnicas);
        } catch (err) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: err.message || 'Error al cargar los datos',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setLoading(false);
        }
    }

    function obtenerLunes(fecha) {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function agregarDias(fecha, dias) {
        const resultado = new Date(fecha);
        resultado.setDate(resultado.getDate() + dias);
        return resultado;
    }

    const hoy = new Date();
    const lunesActual = obtenerLunes(hoy);
    const puedeVolverAtras = fechaInicioSemana > lunesActual;

    function weekNext() {
        setFechaInicioSemana(prev => agregarDias(prev, 7));
    }

    function weekPrev() {
        if (puedeVolverAtras) {
            setFechaInicioSemana(prev => agregarDias(prev, -7));
        }
    }

    const horas = Array.from({ length: 14 }, (_, i) => i + 8); // 8 a 21
    const diasSemana = [
        { nombre: "Lunes", fecha: fechaInicioSemana },
        { nombre: "Martes", fecha: agregarDias(fechaInicioSemana, 1) },
        { nombre: "Miércoles", fecha: agregarDias(fechaInicioSemana, 2) },
        { nombre: "Jueves", fecha: agregarDias(fechaInicioSemana, 3) },
        { nombre: "Viernes", fecha: agregarDias(fechaInicioSemana, 4) }
    ];

    function getColorActividad(id) {
        const numeroId = parseInt(id, 10);
        if (isNaN(numeroId)) {
            return "var(--gray)";
        }
        const index = numeroId % COLORES_ACTIVIDADES.length;
        return COLORES_ACTIVIDADES[index];
    }

    const turnosFiltrados = turnos.filter(turno => {
        // Si hay un filtro seleccionado en el select, y el turno no coincide, lo ocultamos
        if (filtroActividad && turno.actividad_id?.toString() !== filtroActividad) {
            return false;
        }
        // Si no hay filtro, mostramos todos (incluso los que tienen actividad_id en null)
        return true;
    });

    function obtenerTurnosParaCelda(fecha, hora) {
        // 1. Armamos el formato "YYYY-MM-DD" exacto
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaStr = `${year}-${month}-${day}`;

        // 2. Extraemos solo la HORA a buscar (ej: "08", "09", "10")
        const horaBuscada = String(hora).padStart(2, '0');

        return turnosFiltrados.filter(t => {
            if (!t.fecha || !t.hora_inicio) return false;

            // Extraemos solo los primeros 2 caracteres de la hora del turno (ej: de "08:30:00" sacamos "08")
            const horaTurno = t.hora_inicio.substring(0, 2);

            // Verificamos que coincida el día exacto y la misma franja horaria
            const coincideFecha = t.fecha === fechaStr;
            const coincideHora = horaTurno === horaBuscada;

            return coincideFecha && coincideHora;
        });
    }

    function handleTurnoClick(id) {
        console.log(`Clic en el turno ID: ${id}`);
    }

    if (loading) return <div className="loading-state">Cargando calendario...</div>;

    return (
        <div className="calendario-container">
            <div className="calendario-header">
                <div className="filtro-container">
                    <select
                        className="filtro-select"
                        value={filtroActividad}
                        onChange={(e) => setFiltroActividad(e.target.value)}
                    >
                        <option value="">Filtrar por actividades (Todas)</option>
                        {actividades.map((act, index) => (
                            <option key={act.id || index} value={act.id || index}>
                                {act.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="leyenda-actividades">
                    {actividades.map((act, index) => (
                        <div key={act.id || `leyenda-${index}`} className="leyenda-item">
                            <span
                                className="leyenda-color"
                                style={{ backgroundColor: getColorActividad(act.id) }}
                            ></span>
                            <span className="leyenda-texto">{act.nombre}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mes-indicador">
                Semana del {fechaInicioSemana.toLocaleDateString()}
            </div>

            <div className="calendario-grid">
                <div className="calendario-celda header-celda esquina"></div>

                {diasSemana.map((dia, index) => (
                    <div key={`header-dia-${index}`} className="calendario-celda header-celda">
                        <div className="dia-nombre">{dia.nombre}</div>
                        <div className="dia-fecha">{dia.fecha.getDate()}</div>
                    </div>
                ))}

                {horas.map(hora => (
                    <div key={`fila-${hora}`} className="calendario-fila">
                        <div className="calendario-celda hora-celda">
                            {hora}:00
                        </div>
                        {diasSemana.map((dia) => {
                            const turnosEnCelda = obtenerTurnosParaCelda(dia.fecha, hora);

                            return (
                                <div key={`${hora}-${dia.nombre}`} className="calendario-celda dia-celda">
                                    {turnosEnCelda.map(turno => (
                                        <div
                                            key={turno.id}
                                            className="turno-badge"
                                            style={{ backgroundColor: getColorActividad(turno.actividad_id || turno.ActividadId) }}
                                            onClick={() => handleTurnoClick(turno.id)}
                                        >
                                            {/* El operador ?. evita que la app explote si Actividad no viene del backend */}
                                            {turno.Actividad?.nombre || (turno.actividad_id ? `Actividad (#${turno.actividad_id})` : 'Sin Actividad')}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="calendario-navegacion">
                <button
                    className="btn-nav"
                    onClick={weekPrev}
                    disabled={!puedeVolverAtras}
                >
                    <FaChevronLeft /> Anterior
                </button>
                <button className="btn-nav" onClick={weekNext}>
                    Siguiente <FaChevronRight />
                </button>
            </div>
        </div>
    );
}