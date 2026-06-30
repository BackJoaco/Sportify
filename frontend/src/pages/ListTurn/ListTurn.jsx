import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { getTurnos } from "../../api/turno.api";
import { getActividades } from "../../api/actividad.api";
import { useAuth } from "../../context/AuthContext";
import "./ListTurn.css";

const COLORES_ACTIVIDADES = [
    "#1E5BF0", "#2ECC71", "#E74C3C", "#F39C12",
    "#9B59B6", "#00D2FF", "#E67E22", "#16A085",
];

const DIA_ENUM_POR_NOMBRE = {
    Lunes: "LUNES",
    Martes: "MARTES",
    "Miércoles": "MIERCOLES",
    "MiÃ©rcoles": "MIERCOLES",
    Jueves: "JUEVES",
    Viernes: "VIERNES",
    "Sábado": "SABADO",
    "SÃ¡bado": "SABADO",
    Domingo: "DOMINGO"
};

function formatearFechaInput(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizarFecha(fecha) {
    const resultado = new Date(fecha);
    resultado.setHours(0, 0, 0, 0);
    return resultado;
}

function obtenerLunes(fecha) {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function agregarDias(fecha, dias) {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
}

function obtenerInicioPeriodoVisible(fechaBase) {
    const fecha = normalizarFecha(fechaBase);
    const inicio = new Date(fecha);
    inicio.setDate(11);

    if (fecha.getDate() < 11) {
        inicio.setMonth(inicio.getMonth() - 1);
    }

    return inicio;
}

function obtenerFinPeriodoVisible(fechaBase) {
    const inicio = obtenerInicioPeriodoVisible(fechaBase);
    const fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + 1);
    fin.setDate(10);
    return fin;
}

function esFechaEnRango(fecha, inicio, fin) {
    const actual = normalizarFecha(fecha);
    return actual >= normalizarFecha(inicio) && actual <= normalizarFecha(fin);
}

export default function CalendarioTurnos() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [turnos, setTurnos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [filtroActividad, setFiltroActividad] = useState("");
    const [loading, setLoading] = useState(true);
    const [fechaInicioSemana, setFechaInicioSemana] = useState(() => obtenerLunes(new Date()));
    const esAdministrador = usuario?.rol === "ADMINISTRADOR";
    const hoy = normalizarFecha(new Date());
    const inicioPeriodoVisible = esAdministrador ? null : obtenerInicioPeriodoVisible(hoy);
    const finPeriodoVisible = esAdministrador ? null : obtenerFinPeriodoVisible(hoy);

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [turnosData, actividadesData] = await Promise.all([
                    getTurnos(),
                    getActividades()
                ]);

                setTurnos(Array.isArray(turnosData) ? turnosData : []);
                setActividades(Array.isArray(actividadesData) ? actividadesData : []);
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

        cargarDatos();
    }, []);

    const lunesActual = obtenerLunes(hoy);
    const lunesInicioPeriodo = inicioPeriodoVisible ? obtenerLunes(inicioPeriodoVisible) : null;
    const lunesFinPeriodo = finPeriodoVisible ? obtenerLunes(finPeriodoVisible) : null;
    const puedeVolverAtras = esAdministrador
        ? fechaInicioSemana > lunesActual
        : fechaInicioSemana > lunesInicioPeriodo;
    const puedeAvanzar = esAdministrador
        ? true
        : fechaInicioSemana < lunesFinPeriodo;

    function weekNext() {
        if (puedeAvanzar) {
            setFechaInicioSemana(prev => agregarDias(prev, 7));
        }
    }

    function weekPrev() {
        if (puedeVolverAtras) {
            setFechaInicioSemana(prev => agregarDias(prev, -7));
        }
    }

    const horas = Array.from({ length: 13 }, (_, i) => i + 8); 
    const diasSemana = [
        { nombre: "Lunes", fecha: fechaInicioSemana },
        { nombre: "Martes", fecha: agregarDias(fechaInicioSemana, 1) },
        { nombre: "Miércoles", fecha: agregarDias(fechaInicioSemana, 2) },
        { nombre: "Jueves", fecha: agregarDias(fechaInicioSemana, 3) },
        { nombre: "Viernes", fecha: agregarDias(fechaInicioSemana, 4) },
        { nombre: "Sábado", fecha: agregarDias(fechaInicioSemana, 5) },
        { nombre: "Domingo", fecha: agregarDias(fechaInicioSemana, 6) }
    ];

    function getColorActividad(id) {
        const numeroId = parseInt(id, 10);
        if (isNaN(numeroId)) {
            return "var(--gray)";
        }
        return COLORES_ACTIVIDADES[numeroId % COLORES_ACTIVIDADES.length];
    }

    const turnosFiltrados = turnos.filter(turno => {
        const idActividad = turno.actividad_id || turno.ActividadId;
        if (filtroActividad && idActividad?.toString() !== filtroActividad) {
            return false;
        }
        return true;
    });

    function obtenerTurnosParaCelda(dia, hora) {
        const horaBuscada = String(hora).padStart(2, '0');
        const diaSemana = DIA_ENUM_POR_NOMBRE[dia.nombre];

        return turnosFiltrados.filter(t => {
            if (!t.dia_semana || !t.hora_inicio) return false;
            const horaTurno = t.hora_inicio.substring(0, 2);
            return (t.dia_semana === diaSemana && horaTurno === horaBuscada);
        });
    }

    function handleTurnoClick(id, fecha) {
        navigate(`/turnos/${id}?fecha=${formatearFechaInput(fecha)}`);
    }

    if (loading) return <div className="loading-state">Cargando calendario...</div>;

    return (
        <div className="calendario-container">
            <div className="calendario-top-header">
                <div className="header-title-group">
                    <button 
                        className="btn-back" 
                        onClick={() => navigate("/home")} 
                        title="Volver al inicio"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1>Calendario de Turnos</h1>
                        <p className="calendario-subtitle">Visualiza y gestiona las clases de la semana.</p>
                    </div>
                </div>

                {usuario?.rol === "ADMINISTRADOR" && (
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/turnos/crear")}
                    >
                        + Nuevo Turno
                    </button>
                )}
            </div>

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
                {esAdministrador
                    ? `Semana del ${fechaInicioSemana.toLocaleDateString()}`
                    : `Período visible del ${inicioPeriodoVisible.toLocaleDateString()} al ${finPeriodoVisible.toLocaleDateString()}`}
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
                            const fechaDentroDelRango = esAdministrador || esFechaEnRango(dia.fecha, inicioPeriodoVisible, finPeriodoVisible);
                            const turnosEnCelda = fechaDentroDelRango ? obtenerTurnosParaCelda(dia, hora) : [];

                            return (
                                <div
                                    key={`${hora}-${dia.nombre}`}
                                    className={`calendario-celda dia-celda ${fechaDentroDelRango ? "" : "dia-celda-fuera-rango"}`}
                                    aria-disabled={!fechaDentroDelRango}
                                >
                                    {fechaDentroDelRango && turnosEnCelda.map(turno => (
                                        <div
                                            key={turno.id}
                                            className="turno-badge"
                                            style={{ backgroundColor: getColorActividad(turno.actividad_id || turno.ActividadId) }}
                                            onClick={() => handleTurnoClick(turno.id, dia.fecha)}
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
