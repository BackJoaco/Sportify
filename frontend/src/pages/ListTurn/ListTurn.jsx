import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getTurnos } from "../../api/turno.api";
import "./ListTurn.css";

const COLORES_ACTIVIDADES = [
    "#1E5BF0", "#2ECC71", "#E74C3C", "#F39C12",
    "#9B59B6", "#00D2FF", "#E67E22", "#16A085",
];

// Se mueven fuera del componente por ser funciones puras
function obtenerLunes(fecha) {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0); // Crítico: Evita saltos de fecha por diferencias horarias
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function agregarDias(fecha, dias) {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
}

export default function CalendarioTurnos() {
    const [turnos, setTurnos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [filtroActividad, setFiltroActividad] = useState("");
    const [loading, setLoading] = useState(true);
    const [fechaInicioSemana, setFechaInicioSemana] = useState(() => obtenerLunes(new Date()));

    useEffect(() => {
        async function cargarDatos() {
            try {
                // El estado inicial de loading ya es true, no es necesario hacer setLoading(true) de forma síncrona aquí.
                const turnosData = await getTurnos();
                const dataArray = Array.isArray(turnosData) ? turnosData : []; 
                
                setTurnos(dataArray);

                const actividadesUnicas = [];
                const idsVistos = new Set();

                dataArray.forEach(turno => {
                    const id = turno.actividad_id || turno.ActividadId;
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
                setLoading(false); // Esto ocurre de forma asíncrona tras resolverse la petición, lo cual es correcto.
            }
        }

        cargarDatos();
    }, []);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Crítico para comparar correctamente
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

    const horas = Array.from({ length: 14 }, (_, i) => i + 8);
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
        return COLORES_ACTIVIDADES[numeroId % COLORES_ACTIVIDADES.length];
    }

    const turnosFiltrados = turnos.filter(turno => {
        const idActividad = turno.actividad_id || turno.ActividadId; // Unificado
        if (filtroActividad && idActividad?.toString() !== filtroActividad) {
            return false;
        }
        return true;
    });

    function obtenerTurnosParaCelda(fecha, hora) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaStr = `${year}-${month}-${day}`;

        const horaBuscada = String(hora).padStart(2, '0');

        return turnosFiltrados.filter(t => {
            if (!t.fecha || !t.hora_inicio) return false;
            const horaTurno = t.hora_inicio.substring(0, 2);
            return (t.fecha === fechaStr && horaTurno === horaBuscada);
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