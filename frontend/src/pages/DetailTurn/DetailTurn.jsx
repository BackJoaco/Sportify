import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getTurnoById, deleteTurno, getReservasCount, updateTurno } from "../../api/turno.api"; 
import { useAuth } from "../../context/AuthContext"; 
import { crearReserva, crearReservaStaff } from "../../api/reservas.api";
import { getClientes } from "../../api/usuario.api";
// Podés agregar iconos si los tenés importados, ej: import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function DetailTurn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth(); 
  
  const [turno, setTurno] = useState(null);
  const [cantidadInscriptos, setCantidadInscriptos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);

  // NUEVOS ESTADOS PARA EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    entrenador: "",
    fecha: "",
    hora_inicio: "",
    cupo_maximo: ""
  });

  async function fetchTurnoData() {
    try {
      const [turnoData, countData] = await Promise.all([
        getTurnoById(id),
        getReservasCount(id)
      ]);
      
      setTurno(turnoData);
      setCantidadInscriptos(countData.count);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al cargar el turno",
        showConfirmButton: false,
        timer: 3000,
        text: err.message || "Error inesperado",
      });
      navigate("/turnos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTurnoData();
  }, [id, navigate]);

  // --- FUNCIONES DE EDICIÓN ---
  function handleEditToggle() {
    // Cargamos los datos actuales en el formulario antes de mostrarlo
    setFormData({
      entrenador: turno.entrenador,
      fecha: turno.fecha,
      hora_inicio: turno.hora_inicio,
      cupo_maximo: turno.cupo_maximo
    });
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSaveChanges() {
    // Advertencia de regla de negocio
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "¡Atención! Si modificaste datos del turno, todos los usuarios actualmente inscriptos serán dados de baja automáticamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--blue)",
      cancelButtonColor: "var(--gray)",
      confirmButtonText: "Sí, modificar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const respuesta = await updateTurno(id, formData);
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: respuesta.mensaje || "Turno actualizado",
          showConfirmButton: false,
          timer: 4000
        });

        // Apagamos modo edición y recargamos los datos frescos desde el backend
        setIsEditing(false);
        await fetchTurnoData();
        
      } catch (err) {
        console.log("🔴 RESPUESTA DEL BACKEND:", err);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al modificar",
          text: err.message || "Ocurrió un problema",
          showConfirmButton: false,
          timer: 3500
        });
        setLoading(false);
      }
    }
  }

  // --- FUNCIONES DE BORRADO E INSCRIPCIÓN (Se mantienen iguales) ---
  async function handleDelete() {
    // ... tu lógica de borrar ... (sin cambios)
    const result = await Swal.fire({
      title: "¿Eliminar este turno?",
      text: "No podrás revertir esto. Solo se eliminará si no tiene reservas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--blue)",
      cancelButtonColor: "var(--gray)",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await deleteTurno(id);
        Swal.fire({
          toast: true, position: "top-end", icon: "success", title: "Turno eliminado exitosamente", showConfirmButton: false, timer: 2500
        });
        navigate("/turnos");
      } catch (err) {
        Swal.fire({
          toast: true, position: "top-end", icon: "error", title: err.message || "Error al eliminar", showConfirmButton: false, timer: 3500
        });
      }
    }
  }

  async function handleInscripcionCliente() {
    // ... tu lógica de inscripción cliente ... (sin cambios)
  }

  async function handleInscripcionTercero() {
    // ... tu lógica de inscripción empleado ... (sin cambios)
  }

  if (loading) {
    return <div className="home-container">Cargando información...</div>;
  }

  if (!turno) return null;

  const cupoOcupacion = `${cantidadInscriptos} / ${turno.cupo_maximo}`;
  const estaLleno = cantidadInscriptos >= turno.cupo_maximo;
  const esStaff = usuario?.rol === "EMPLEADO" || usuario?.rol === "ADMINISTRADOR";

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Detalle del Turno</span>
          <h1>{turno.Actividad?.nombre || "Actividad Desconocida"}</h1>
          <p>Gestión e información detallada de la clase.</p>
        </div>
        
        <div className="home-header-actions">
          {/* Si está editando, mostramos botones de Guardar/Cancelar */}
          {isEditing ? (
            <>
              <button className="btn-secondary" onClick={handleCancelEdit}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveChanges}>
                Guardar Cambios
              </button>
            </>
          ) : (
            /* Si NO está editando, mostramos las acciones normales */
            <>
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                Volver
              </button>

              {usuario?.rol === "CLIENTE" && (
                <button 
                  className="btn-primary" 
                  onClick={handleInscripcionCliente}
                  disabled={isReserving || estaLleno}
                  style={estaLleno ? { backgroundColor: "var(--gray)", cursor: "not-allowed" } : {}}
                >
                  {isReserving ? "Procesando..." : estaLleno ? "Sin Cupo" : "Inscribirse"}
                </button>
              )}

              {esStaff && (
                <button 
                  className="btn-primary" 
                  onClick={handleInscripcionTercero}
                  disabled={isReserving || estaLleno}
                  style={estaLleno ? { backgroundColor: "var(--gray)", cursor: "not-allowed" } : {}}
                >
                  {isReserving ? "Cargando..." : estaLleno ? "Cupo Completo" : "Inscribir Cliente"}
                </button>
              )}

              {esStaff && (
                <button className="btn-secondary" onClick={handleEditToggle} style={{ borderColor: "var(--blue)", color: "var(--blue)" }}>
                  Editar
                </button>
              )}

              {usuario?.rol === "ADMINISTRADOR" && (
                <button className="btn-secondary" onClick={handleDelete} style={{ borderColor: "var(--gray)", color: "var(--gray)" }}>
                  Eliminar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="home-layout">
        <div className="home-panel profile-panel">
          <div className="panel-title">
            <h2>Información General</h2>
          </div>
          
          <div className="data-grid">
            <div>
              <span>Entrenador</span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="entrenador" 
                  value={formData.entrenador} 
                  onChange={handleFormChange}
                  className="form-input-inline"
                />
              ) : (
                <p>{turno.entrenador}</p>
              )}
            </div>
            <div>
              <span>Fecha</span>
              {isEditing ? (
                <input 
                  type="date" 
                  name="fecha" 
                  value={formData.fecha} 
                  onChange={handleFormChange}
                  className="form-input-inline"
                />
              ) : (
                <p>{turno.fecha}</p>
              )}
            </div>
            <div>
              <span>Hora de Inicio</span>
              {isEditing ? (
                <input 
                  type="time" 
                  name="hora_inicio" 
                  value={formData.hora_inicio} 
                  onChange={handleFormChange}
                  className="form-input-inline"
                />
              ) : (
                <p>{turno.hora_inicio}</p>
              )}
            </div>
            <div>
              <span>Ocupación / Cupo Máximo</span>
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <p>{cantidadInscriptos} /</p>
                  <input 
                    type="number" 
                    name="cupo_maximo" 
                    value={formData.cupo_maximo} 
                    onChange={handleFormChange}
                    min={cantidadInscriptos} /* Previene reducir el cupo por debajo de los inscriptos actuales */
                    className="form-input-inline"
                    style={{ width: "80px" }}
                  />
                </div>
              ) : (
                <p>{cupoOcupacion}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}