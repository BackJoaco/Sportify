import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  altaAbonadoTurno,
  deleteTurno,
  getOcupacionTurno,
  getTurnoById,
  salirDeColaAbonadoTurno,
  updateTurno,
} from "../../api/turno.api";
import { cancelarReserva, crearReserva, crearReservaStaff, salirDeColaNoAbonado } from "../../api/reservas.api";
import { obtenerMontoSenaTurno, obtenerMontoSuscripcionMensual, pagarSuscripcionMensual } from "../../api/pago.api";
import { getClientes } from "../../api/usuario.api";
import { useAuth } from "../../context/AuthContext";
import PaymentModal from "../../components/PaymentModal/PaymentModal";
import "./DetailTurn.css";

const HORAS_TURNO = Array.from({ length: 13 }, (_, i) => {
  const hora = String(i + 8).padStart(2, "0");
  return `${hora}:00`;
});

const DIAS = [
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIERCOLES", label: "Miercoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
  { value: "SABADO", label: "Sabado" },
  { value: "DOMINGO", label: "Domingo" },
];

const DIA_INDEX = {
  DOMINGO: 0,
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

function fechaInput(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizarFechaHora(fecha, hora) {
  if (!fecha || !hora) {
    return null;
  }

  const fechaHora = new Date(`${fecha}T${hora}`);
  return Number.isNaN(fechaHora.getTime()) ? null : fechaHora;
}

function proximaFechaParaDia(diaSemana) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = DIA_INDEX[diaSemana] ?? hoy.getDay();
  const diff = (objetivo - hoy.getDay() + 7) % 7;
  const fecha = new Date(hoy);
  fecha.setDate(hoy.getDate() + diff);
  return fechaInput(fecha);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

export default function DetailTurn() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [turno, setTurno] = useState(null);
  const [ocupacion, setOcupacion] = useState(null);
  const [fechaClase, setFechaClase] = useState(searchParams.get("fecha") || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pagoModal, setPagoModal] = useState({
    open: false,
    mode: null,
    amount: 0,
    title: "",
    subtitle: "",
  });
  const [formData, setFormData] = useState({
    entrenador: "",
    dia_semana: "",
    hora_inicio: "",
    cupo_maximo: "",
  });

  const esAdmin = usuario?.rol === "ADMINISTRADOR";
  const esEmpleado = usuario?.rol === "EMPLEADO";
  const esCliente = usuario?.rol === "CLIENTE";
  const fechaClaseSeleccionada = useMemo(
    () => normalizarFechaHora(fechaClase, turno?.hora_inicio),
    [fechaClase, turno]
  );
  const claseYaPaso = useMemo(() => {
    if (!fechaClaseSeleccionada) return false;
    return fechaClaseSeleccionada <= new Date();
  }, [fechaClaseSeleccionada]);

  const esAbonadoActivo = useMemo(() => {
    return ocupacion?.abonados?.some((abonado) => String(abonado.usuario_id) === String(usuario?.id));
  }, [ocupacion, usuario]);

  const colaAbonadoUsuario = useMemo(() => {
    if (!ocupacion || !usuario) return null;

    const esDelUsuario = (registro) => String(registro.usuario_id) === String(usuario.id);
    return ocupacion.colaAbonados?.find(esDelUsuario) || null;
  }, [ocupacion, usuario]);

  const reservaConfirmadaUsuario = useMemo(() => {
    if (!ocupacion || !usuario) return null;

    return ocupacion.reservasFecha?.find(
      (reserva) =>
        String(reserva.usuario_id) === String(usuario.id) &&
        reserva.estado === "CONFIRMADA"
    ) || null;
  }, [ocupacion, usuario]);

  const colaNoAbonadoUsuario = useMemo(() => {
    if (!ocupacion || !usuario) return null;

    const esDelUsuario = (registro) => String(registro.usuario_id) === String(usuario.id);
    return ocupacion.colaNoAbonados?.find(esDelUsuario) || null;
  }, [ocupacion, usuario]);

  const estadoCliente = useMemo(() => {
    if (!esCliente || !usuario || !ocupacion) return null;

    const esDelUsuario = (registro) => String(registro.usuario_id) === String(usuario.id);
    const esperaNoAbonado = colaNoAbonadoUsuario;
    const esperaAbonado = ocupacion.colaAbonados?.find(esDelUsuario);

    if (esAbonadoActivo) {
      return {
        tipo: "success",
        titulo: "Estás abonado a este turno",
        detalle: `Tenés tu lugar fijo para ${turno?.Actividad?.nombre || "esta actividad"} los ${turno?.dia_semana?.toLowerCase()} a las ${turno?.hora_inicio?.substring(0, 5)} hs.`,
      };
    }

    if (colaAbonadoUsuario?.estado === "CUPO_RESERVADO") {
      return {
        tipo: "warning",
        titulo: "Tenés un cupo de abonado reservado",
        detalle: "Si salís de la cola, ese lugar puede reasignarse al siguiente cliente en espera.",
      };
    }

    if (colaAbonadoUsuario) {
      return {
        tipo: "info",
        titulo: "Estás en cola de abonados",
        detalle: "Podés salir de esta cola cuando quieras.",
      };
    }

    if (reservaConfirmadaUsuario) {
      return {
        tipo: "success",
        titulo: "Reservaste esta clase puntual",
        detalle: `Tu reserva es solo para el ${formatearFecha(fechaClase)}. No te deja un lugar fijo para las próximas semanas.`,
      };
    }

    if (esperaNoAbonado?.estado === "CUPO_RESERVADO") {
      return {
        tipo: "warning",
        titulo: "Tenés un cupo puntual reservado",
        detalle: `Se liberó un lugar para el ${formatearFecha(fechaClase)}. Confirmalo para no perderlo.`,
      };
    }

    if (esperaNoAbonado) {
      return {
        tipo: "info",
        titulo: "Estás en cola para esta clase",
        detalle: `Si se libera un cupo puntual para el ${formatearFecha(fechaClase)}, se te reservará el lugar.`,
      };
    }

    if (esperaAbonado) {
      return {
        tipo: "info",
        titulo: "Estás en cola para abonarte",
        detalle: "Cuando se libere un cupo fijo de abonado, vas a poder tomar ese lugar.",
      };
    }

    return {
      tipo: "neutral",
      titulo: "No tenés inscripción activa en este turno",
      detalle: "Podés reservar una clase puntual o abonarte si hay cupo fijo disponible.",
    };
  }, [colaAbonadoUsuario, colaNoAbonadoUsuario, esAbonadoActivo, esCliente, fechaClase, ocupacion, reservaConfirmadaUsuario, turno, usuario]);

  const estadoReservaPuntual = useMemo(() => {
    if (!esCliente || !usuario || !ocupacion) return null;
    if (reservaConfirmadaUsuario) {
      return "RESERVADA";
    }

    const esperaNoAbonado = colaNoAbonadoUsuario;

    if (esperaNoAbonado?.estado === "CUPO_RESERVADO") {
      return "CUPO_RESERVADO";
    }

    if (esperaNoAbonado) {
      return "EN_ESPERA";
    }

    return null;
  }, [colaNoAbonadoUsuario, esCliente, ocupacion, reservaConfirmadaUsuario, usuario]);

  const fetchTurnoData = useCallback(async (fecha = fechaClase) => {
    try {
      setLoading(true);
      const turnoData = await getTurnoById(id);
      const fechaConsulta = fecha || proximaFechaParaDia(turnoData.dia_semana);
      const ocupacionData = await getOcupacionTurno(id, fechaConsulta);

      setTurno(turnoData);
      setFechaClase(fechaConsulta);
      setOcupacion(ocupacionData);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Error al cargar el turno",
        showConfirmButton: false,
        timer: 3000,
      });
      navigate("/turnos");
    } finally {
      setLoading(false);
    }
  }, [fechaClase, id, navigate]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTurnoData();
    });
  }, [fetchTurnoData]);

  function handleEditToggle() {
    setFormData({
      entrenador: turno.entrenador,
      dia_semana: turno.dia_semana,
      hora_inicio: turno.hora_inicio?.substring(0, 5),
      cupo_maximo: turno.cupo_maximo,
    });
    setIsEditing(true);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveChanges() {
    try {
      setSaving(true);
      const respuesta = await updateTurno(id, {
        ...formData,
        cupo_maximo: parseInt(formData.cupo_maximo, 10),
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: respuesta.mensaje || "Turno actualizado",
        showConfirmButton: false,
        timer: 2500,
      });

      setIsEditing(false);
      await fetchTurnoData(fechaClase);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al actualizar",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Eliminar turno fijo",
      text: "Solo se eliminará si no tiene reservas o abonados asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteTurno(id);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Turno eliminado",
        showConfirmButton: false,
        timer: 2500,
      });
      navigate("/turnos");
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Error al eliminar",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }

  async function ejecutarAccion(accion, mensajeOk) {
    try {
      setSaving(true);
      const respuesta = await accion();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: respuesta.message || respuesta.mensaje || mensajeOk,
        showConfirmButton: false,
        timer: 3000,
      });
      await fetchTurnoData(fechaClase);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al procesar la accion",
        showConfirmButton: false,
        timer: 3500,
      });
    } finally {
      setSaving(false);
    }
  }

  function abrirPagoModal(data) {
    setPagoModal({
      open: true,
      mode: data.mode,
      amount: data.amount,
      title: data.title,
      subtitle: data.subtitle,
    });
  }

  function cerrarPagoModal() {
    if (saving) {
      return;
    }

    setPagoModal({
      open: false,
      mode: null,
      amount: 0,
      title: "",
      subtitle: "",
    });
  }

  async function handleConfirmarPago(tarjetaDebito) {
    try {
      setSaving(true);

      if (pagoModal.mode === "sena") {
        const respuestaReserva = await crearReserva({
          turno_id: turno.id,
          fecha: fechaClase,
          tarjetaDebito,
        });

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: respuestaReserva.enEspera ? "info" : "success",
          title: respuestaReserva.mensaje || respuestaReserva.message || "Reserva procesada",
          showConfirmButton: false,
          timer: 3000,
        });

        await fetchTurnoData(fechaClase);
      }

      if (pagoModal.mode === "abonado") {
        await pagarSuscripcionMensual({
          turnoId: turno.id,
          tarjetaDebito,
        });

        await ejecutarAccion(() => altaAbonadoTurno(turno.id), "Solicitud de abono procesada");
      }

      cerrarPagoModal();
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al procesar el pago",
        showConfirmButton: false,
        timer: 3500,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleReservaNoAbonado() {
    if (claseYaPaso) {
      return;
    }

    if (cuposFecha <= 0) {
      await ejecutarAccion(
        () => crearReserva({ turno_id: turno.id, fecha: fechaClase }),
        "Solicitud procesada"
      );
      return;
    }

    try {
      setSaving(true);
      const resultado = await obtenerMontoSenaTurno({ turnoId: turno.id });

      if (!resultado?.monto || Number(resultado.monto) <= 0) {
        throw new Error("No se pudo calcular el monto de la seña");
      }

      abrirPagoModal({
        mode: "sena",
        amount: Number(resultado.monto),
        title: `Pagar seña - ${turno?.Actividad?.nombre || "Reserva"}`,
        subtitle: `Clase del ${formatearFecha(fechaClase)}`,
      });
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "No se pudo calcular el monto de la seña",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSalirColaNoAbonado() {
    if (!colaNoAbonadoUsuario) return;

    await ejecutarAccion(
      () => salirDeColaNoAbonado({ turno_id: turno.id, fecha: fechaClase }),
      "Saliste de la cola de no abonados"
    );
  }

  async function handleSalirColaAbonado() {
    if (!colaAbonadoUsuario) return;

    const result = await Swal.fire({
      title: "¿Salir de la cola de abonados?",
      text: colaAbonadoUsuario.estado === "CUPO_RESERVADO"
        ? "Si salís, el cupo reservado se podrá reasignar al siguiente en espera."
        : "Vas a salir de la cola de abonados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--blue)",
      cancelButtonColor: "var(--gray)",
      confirmButtonText: "Sí, salir de la cola",
      cancelButtonText: "Volver",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      const response = await salirDeColaAbonadoTurno(turno.id);

      Swal.fire({
        title: "Cola de abonados actualizada",
        text: response.message,
        icon: response.cupoLiberado ? "success" : "info",
        confirmButtonColor: "var(--blue)",
      });

      await fetchTurnoData(fechaClase);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al salir de la cola",
        showConfirmButton: false,
        timer: 3500,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelarClaseAbonado() {
    if (!reservaConfirmadaUsuario) return;

    const tieneSenaAbonada = reservaConfirmadaUsuario.estado_pago !== "PENDIENTE";

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
      cancelButtonText: "Volver",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      const response = await cancelarReserva(reservaConfirmadaUsuario.id);

      Swal.fire({
        title: "Reserva cancelada",
        text: response.message,
        icon: response.devuelveSena ? "success" : "info",
        confirmButtonColor: "var(--blue)",
      });

      await fetchTurnoData(fechaClase);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al cancelar",
        showConfirmButton: false,
        timer: 3500,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAltaAbonado() {
    const debeIrACola =
      !esAbonadoActivo &&
      !colaAbonadoUsuario &&
      abonadosCount >= turno.cupo_maximo;

    if (debeIrACola) {
      await ejecutarAccion(
        () => altaAbonadoTurno(turno.id),
        "El cliente fue agregado a la cola de abonados."
      );
      return;
    }

    try {
      setSaving(true);
      const resultado = await obtenerMontoSuscripcionMensual({ turnoId: turno.id });

      if (!resultado?.monto || Number(resultado.monto) <= 0) {
        throw new Error("No se pudo calcular el monto del abono mensual");
      }

      abrirPagoModal({
        mode: "abonado",
        amount: Number(resultado.monto),
        title: `Abonarte al turno - ${turno?.Actividad?.nombre || "Turno"}`,
        subtitle: "Se cobra el mes en curso con 20% de descuento sobre las clases restantes.",
      });
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "No se pudo calcular el monto del abono mensual",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleInscripcionTercero() {
    try {
      setSaving(true);
      const listaClientes = await getClientes();
      const inputOptions = {};
      listaClientes.forEach((cli) => {
        inputOptions[cli.id] = `${cli.apellido}, ${cli.nombre} (DNI: ${cli.dni})`;
      });
      setSaving(false);

      const { value: clienteSeleccionadoId } = await Swal.fire({
        title: "Reservar no abonado",
        text: `Clase del ${formatearFecha(fechaClase)}`,
        input: "select",
        inputOptions,
        inputPlaceholder: "Selecciona un cliente...",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      });

      if (!clienteSeleccionadoId) return;

      await ejecutarAccion(
        () => crearReservaStaff({
          usuario_id: parseInt(clienteSeleccionadoId, 10),
          turno_id: turno.id,
          fecha: fechaClase,
        }),
        "Reserva procesada"
      );
    } catch (err) {
      setSaving(false);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || err.mensaje || "Error al cargar clientes",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }

  if (loading) return <div className="home-container">Cargando informacion...</div>;
  if (!turno) return null;

  const abonadosCount = ocupacion?.abonados?.length || 0;
  const cuposFecha = ocupacion?.cuposDisponiblesFecha ?? 0;
  const mostrarBotonCancelarClase = Boolean(reservaConfirmadaUsuario) && !claseYaPaso;
  const mostrarBotonAbono = esCliente && !esAbonadoActivo && !colaAbonadoUsuario;
  const mostrarBotonAbonoEnCola = esCliente && !esAbonadoActivo && abonadosCount >= turno.cupo_maximo;
  const mostrarBotonSalirColaNoAbonados = esCliente && Boolean(colaNoAbonadoUsuario);
  const mostrarBotonSalirColaAbonados = esCliente && Boolean(colaAbonadoUsuario);
  const textoBotonSalirColaNoAbonados = colaNoAbonadoUsuario?.estado === "CUPO_RESERVADO"
    ? "Salir de la lista de espera"
    : "Salir de la cola de no abonados";
  const textoBotonSalirColaAbonados = colaAbonadoUsuario?.estado === "CUPO_RESERVADO"
    ? "Salir de la cola de abonados y liberar mi cupo"
    : "Salir de la cola de abonados";
  const puedeReservarClase = esCliente && !esAbonadoActivo && !colaNoAbonadoUsuario && !colaAbonadoUsuario && !claseYaPaso && !reservaConfirmadaUsuario;

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <span className="home-kicker">Detalle del Turno Fijo</span>
          <h1>{turno.Actividad?.nombre || "Actividad"}</h1>
          <p>{turno.dia_semana} a las {turno.hora_inicio?.substring(0, 5)} hs</p>
        </div>

        <div className="home-header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Volver</button>
          {esAdmin && !isEditing && (
            <button className="btn-secondary" onClick={handleEditToggle}>Editar</button>
          )}
          {esAdmin && !isEditing && (
            <button className="btn-secondary" onClick={handleDelete}>Eliminar</button>
          )}
          {isEditing && (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="home-layout">
        <div className="home-panel profile-panel">
          <div className="panel-title">
            <h2>Informacion general</h2>
          </div>

          <div className="data-grid">
            <div>
              <span>Entrenador</span>
              {isEditing ? (
                <input className="form-input-inline" name="entrenador" value={formData.entrenador} onChange={handleFormChange} />
              ) : (
                <p>{turno.entrenador}</p>
              )}
            </div>
            <div>
              <span>Dia fijo</span>
              {isEditing ? (
                <select className="form-input-inline" name="dia_semana" value={formData.dia_semana} onChange={handleFormChange}>
                  {DIAS.map((dia) => <option key={dia.value} value={dia.value}>{dia.label}</option>)}
                </select>
              ) : (
                <p>{turno.dia_semana}</p>
              )}
            </div>
            <div>
              <span>Hora</span>
              {isEditing ? (
                <select className="form-input-inline" name="hora_inicio" value={formData.hora_inicio} onChange={handleFormChange}>
                  {HORAS_TURNO.map((hora) => <option key={hora} value={hora}>{hora}</option>)}
                </select>
              ) : (
                <p>{turno.hora_inicio?.substring(0, 5)} hs</p>
              )}
            </div>
            <div>
              <span>Cupos abonados</span>
              {isEditing ? (
                <input className="form-input-inline" type="number" name="cupo_maximo" min={abonadosCount} value={formData.cupo_maximo} onChange={handleFormChange} />
              ) : (
                <p>{abonadosCount} / {turno.cupo_maximo}</p>
              )}
            </div>
          </div>

          {estadoCliente && (
            <div className={`client-turn-status client-turn-status-${estadoCliente.tipo}`}>
              <span>Tu estado</span>
              <strong>{estadoCliente.titulo}</strong>
              <p>{estadoCliente.detalle}</p>
            </div>
          )}
        </div>

        <div className="home-panel">
          <div className="panel-title">
            <h2>Clase puntual</h2>
          </div>
          <div className="data-grid">
            <div>
              <span>Fecha</span>
              <input
                className="form-input-inline"
                type="date"
                value={fechaClase}
                onChange={(e) => fetchTurnoData(e.target.value)}
              />
            </div>
            <div>
              <span>Cupos puntuales disponibles</span>
              <p>{cuposFecha}</p>
            </div>
            <div>
              <span>No abonados confirmados</span>
              <p>{ocupacion?.reservasFecha?.filter((r) => r.tipo_reserva === "NO_ABONADO" && r.estado === "CONFIRMADA").length || 0}</p>
            </div>
            <div>
              <span>Cola no abonados</span>
              <p>{ocupacion?.colaNoAbonados?.length || 0}</p>
            </div>
          </div>

          <div className="home-header-actions" style={{ marginTop: "1rem" }}>
            {puedeReservarClase && (
              <button
                className="btn-primary"
                disabled={saving || Boolean(estadoReservaPuntual)}
                onClick={handleReservaNoAbonado}
              >
                {cuposFecha <= 0 ? "Inscribirse en lista de espera" : "Reservar clase"}
              </button>
            )}
            {mostrarBotonSalirColaNoAbonados && (
              <button className="btn-secondary" disabled={saving} onClick={handleSalirColaNoAbonado}>
                {textoBotonSalirColaNoAbonados}
              </button>
            )}
            {mostrarBotonSalirColaAbonados && (
              <button className="btn-secondary" disabled={saving} onClick={handleSalirColaAbonado}>
                {textoBotonSalirColaAbonados}
              </button>
            )}
            {mostrarBotonCancelarClase && (
              <button className="btn-secondary" disabled={saving} onClick={handleCancelarClaseAbonado}>
                Cancelar esta clase
              </button>
            )}
            {esEmpleado && (
              <button className="btn-primary" disabled={saving} onClick={handleInscripcionTercero}>
                Reservar no abonado
              </button>
            )}
          </div>
        </div>

        <div className="home-panel">
          <div className="panel-title">
            <h2>Abonados</h2>
          </div>
          <div className="data-grid">
            <div>
              <span>Abonados activos</span>
              <p>{abonadosCount}</p>
            </div>
            <div>
              <span>Cola abonados</span>
              <p>{ocupacion?.colaAbonados?.length || 0}</p>
            </div>
          </div>

          <div className="home-header-actions" style={{ marginTop: "1rem" }}>
            {mostrarBotonAbono && (
              <button className="btn-primary" disabled={saving} onClick={handleAltaAbonado}>
                {mostrarBotonAbonoEnCola ? "Ingresar en cola de abonados" : "Abonarme al turno"}
              </button>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        open={pagoModal.open}
        title={pagoModal.title}
        subtitle={pagoModal.subtitle}
        amount={pagoModal.amount}
        amountLabel={pagoModal.mode === "abonado" ? "Abono mensual" : "Seña"}
        confirmLabel={pagoModal.mode === "abonado" ? "Pagar y abonar" : "Pagar y reservar"}
        onClose={cerrarPagoModal}
        onSubmit={handleConfirmarPago}
        loading={saving}
      />
    </div>
  );
}
