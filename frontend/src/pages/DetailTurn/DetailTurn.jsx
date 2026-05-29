import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getTurnoById, deleteTurno, getReservasCount } from "../../api/turno.api"; 
import { useAuth } from "../../context/AuthContext"; 
import { crearReserva, crearReservaStaff } from "../../api/reservas.api";
import { getClientes } from "../../api/usuario.api";

export default function DetailTurn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth(); 
  
  const [turno, setTurno] = useState(null);
  const [cantidadInscriptos, setCantidadInscriptos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
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
    fetchTurnoData();
  }, [id, navigate]);

  async function handleDelete() {
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
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Turno eliminado exitosamente",
          showConfirmButton: false,
          timer: 2500
        });
        navigate("/turnos");
      } catch (err) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: err.message || "Error al eliminar el turno",
          showConfirmButton: false,
          timer: 3500
        });
      }
    }
  }

  async function handleInscripcionCliente() {
    if (cantidadInscriptos >= turno.cupo_maximo) {
        return Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "El turno ya no tiene cupos disponibles",
            showConfirmButton: false,
            timer: 3000
        });
    }

    const confirmacion = await Swal.fire({
      title: "¿Confirmar reserva?",
      text: `Vas a reservar un lugar para ${turno.Actividad?.nombre} el ${turno.fecha} a las ${turno.hora_inicio}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--blue)",
      cancelButtonColor: "var(--gray)",
      confirmButtonText: "Sí, reservar",
      cancelButtonText: "Cancelar"
    });

    if (confirmacion.isConfirmed) {
      setIsReserving(true);
      try {
        await crearReserva({
            usuario_id: usuario.id,
            turno_id: turno.id
        });

        setCantidadInscriptos(prev => prev + 1);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Reserva confirmada exitosamente",
          showConfirmButton: false,
          timer: 2500
        });
      } catch (err) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: err.message || err.mensaje || "Error al procesar la reserva",
          showConfirmButton: false,
          timer: 3500
        });
      } finally {
        setIsReserving(false);
      }
    }
  }

  // NUEVA LÓGICA: Inscripción de un tercero (Flujo del Empleado)
  async function handleInscripcionTercero() {
    if (cantidadInscriptos >= turno.cupo_maximo) {
      return Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "No hay cupos disponibles en este turno",
          showConfirmButton: false,
          timer: 3000
      });
    }

    try {
      setIsReserving(true);
      // 1. Buscamos la lista de clientes registrados en el sistema
      const listaClientes = await getClientes();
      
      // 2. Transformamos el arreglo de clientes en el formato de opciones que exige SweetAlert2
      const inputOptions = {};
      listaClientes.forEach(cli => {
        inputOptions[cli.id] = `${cli.apellido}, ${cli.nombre} (DNI: ${cli.dni})`;
      });

      setIsReserving(false);

      // 3. Mostramos el modal interactivo con el desplegable de clientes
      const { value: clienteSeleccionadoId } = await Swal.fire({
        title: "Inscribir Cliente",
        text: "Selecciona el cliente que asistirá a la clase:",
        input: "select",
        inputOptions: inputOptions,
        inputPlaceholder: "Seleccioná un cliente...",
        showCancelButton: true,
        confirmButtonColor: "var(--blue)",
        cancelButtonColor: "var(--gray)",
        confirmButtonText: "Confirmar Inscripción",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (!value) {
            return "Es obligatorio seleccionar un cliente para proceder";
          }
        }
      });

      // 4. Si el empleado seleccionó un usuario válido y confirmó el modal
      if (clienteSeleccionadoId) {
        setIsReserving(true);
        
        // Enviamos la petición al endpoint de staff
        await crearReservaStaff({
          usuario_id: parseInt(clienteSeleccionadoId, 10),
          turno_id: turno.id
        });

        setCantidadInscriptos(prev => prev + 1);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Cliente inscripto correctamente",
          showConfirmButton: false,
          timer: 2500
        });
      }

    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al procesar la inscripción",
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setIsReserving(false);
    }
  }

  if (loading) {
    return <div className="home-container">Cargando información del turno...</div>;
  }

  if (!turno) return null;

  const cupoOcupacion = `${cantidadInscriptos} / ${turno.cupo_maximo}`;
  const estaLleno = cantidadInscriptos >= turno.cupo_maximo;

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Detalle del Turno</span>
          <h1>{turno.Actividad?.nombre || "Actividad Desconocida"}</h1>
          <p>Gestión e información detallada de la clase.</p>
        </div>
        
        <div className="home-header-actions">
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

          {/* BOTÓN CONECTADO PARA EL EMPLEADO */}
          {usuario?.rol === "EMPLEADO" && (
            <button 
              className="btn-primary" 
              onClick={handleInscripcionTercero}
              disabled={isReserving || estaLleno}
              style={estaLleno ? { backgroundColor: "var(--gray)", cursor: "not-allowed" } : {}}
            >
              {isReserving ? "Cargando..." : estaLleno ? "Cupo Completo" : "Inscribir"}
            </button>
          )}

          {usuario?.rol === "ADMINISTRADOR" && (
            <button 
              className="btn-secondary" 
              onClick={handleDelete}
              style={{ borderColor: "var(--gray)", color: "var(--gray)" }}
            >
              Eliminar
            </button>
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
              <p>{turno.entrenador}</p>
            </div>
            <div>
              <span>Fecha</span>
              <p>{turno.fecha}</p>
            </div>
            <div>
              <span>Hora de Inicio</span>
              <p>{turno.hora_inicio}</p>
            </div>
            <div>
              <span>Ocupación</span>
              <p>{cupoOcupacion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}