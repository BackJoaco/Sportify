import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  altaAbonadoTurno,
  bajaAbonadoTurno,
  deleteTurno,
  getOcupacionTurno,
  getTurnoById,
  updateTurno,
} from "../../api/turno.api";
import { cancelarClaseAbonado, crearReserva, crearReservaStaff } from "../../api/reservas.api";
import { getClientes } from "../../api/usuario.api";
import { useAuth } from "../../context/AuthContext";
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

function formatearMonto(monto) {
  const montoNumerico = Number(monto);

  if (Number.isNaN(montoNumerico)) {
    return "$0";
  }

  return montoNumerico.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
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
  const [formData, setFormData] = useState({
    entrenador: "",
    dia_semana: "",
    hora_inicio: "",
    cupo_maximo: "",
  });

  const esAdmin = usuario?.rol === "ADMINISTRADOR";
  const esEmpleado = usuario?.rol === "EMPLEADO";
  const esCliente = usuario?.rol === "CLIENTE";

  const esAbonadoActivo = useMemo(() => {
    return ocupacion?.abonados?.some((abonado) => String(abonado.usuario_id) === String(usuario?.id));
  }, [ocupacion, usuario]);

  const estadoCliente = useMemo(() => {
    if (!esCliente || !usuario || !ocupacion) return null;

    const esDelUsuario = (registro) => String(registro.usuario_id) === String(usuario.id);
    const reservasCliente = ocupacion.reservasFecha?.filter(esDelUsuario) || [];
    const reservaAbonadoConfirmada = reservasCliente.find(
      (reserva) => reserva.tipo_reserva === "ABONADO" && reserva.estado === "CONFIRMADA"
    );
    const reservaAbonadoCancelada = reservasCliente.find(
      (reserva) => reserva.tipo_reserva === "ABONADO" && reserva.estado === "CANCELADA"
    );
    const reservaNoAbonadoConfirmada = reservasCliente.find(
      (reserva) => reserva.tipo_reserva === "NO_ABONADO" && reserva.estado === "CONFIRMADA"
    );
    const esperaNoAbonado = ocupacion.colaNoAbonados?.find(esDelUsuario);
    const esperaAbonado = ocupacion.colaAbonados?.find(esDelUsuario);

    if (esAbonadoActivo && reservaAbonadoCancelada && !reservaAbonadoConfirmada) {
      return {
        tipo: "warning",
        titulo: "Estás abonado a este turno",
        detalle: `Cancelaste la clase del ${formatearFecha(fechaClase)}. Tu lugar fijo sigue activo para las próximas clases.`,
      };
    }

    if (esAbonadoActivo) {
      return {
        tipo: "success",
        titulo: "Estás abonado a este turno",
        detalle: `Tenés tu lugar fijo para ${turno?.Actividad?.nombre || "esta actividad"} los ${turno?.dia_semana?.toLowerCase()} a las ${turno?.hora_inicio?.substring(0, 5)} hs.`,
      };
    }

    if (reservaNoAbonadoConfirmada) {
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
  }, [esAbonadoActivo, esCliente, fechaClase, ocupacion, turno, usuario]);

  const estadoReservaPuntual = useMemo(() => {
    if (!esCliente || !usuario || !ocupacion) return null;

    const esDelUsuario = (registro) => String(registro.usuario_id) === String(usuario.id);
    const reservaNoAbonadoConfirmada = ocupacion.reservasFecha?.some(
      (reserva) =>
        esDelUsuario(reserva) &&
        reserva.tipo_reserva === "NO_ABONADO" &&
        reserva.estado === "CONFIRMADA"
    );

    if (reservaNoAbonadoConfirmada) {
      return "RESERVADA";
    }

    const esperaNoAbonado = ocupacion.colaNoAbonados?.find(esDelUsuario);

    if (esperaNoAbonado?.estado === "CUPO_RESERVADO") {
      return "CUPO_RESERVADO";
    }

    if (esperaNoAbonado) {
      return "EN_ESPERA";
    }

    return null;
  }, [esCliente, ocupacion, usuario]);

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

  function calcularSenaTurno() {
    const precioClase = Number(turno?.Actividad?.precio_clase);

    if (!precioClase || Number.isNaN(precioClase)) {
      return 0;
    }

    return precioClase * 0.5;
  }

  async function solicitarTarjetaSena() {
    const montoSena = calcularSenaTurno();

    if (montoSena <= 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "No se pudo calcular el monto de la seña",
        showConfirmButton: false,
        timer: 3000,
      });
      return null;
    }

    const { value: tarjetaDebito } = await Swal.fire({
      title: "Pagar seña",
      html: `
        <p style="margin: 0 0 12px;">Clase del ${formatearFecha(fechaClase)} - Seña ${formatearMonto(montoSena)}</p>
        <input id="swal-card-number" class="swal2-input" placeholder="Numero de tarjeta">
        <input id="swal-card-name" class="swal2-input" placeholder="Nombre">
        <input id="swal-card-lastname" class="swal2-input" placeholder="Apellido">
        <input id="swal-card-expiration" class="swal2-input" placeholder="Vencimiento MM/AA">
        <input id="swal-card-cvv" class="swal2-input" placeholder="CVV">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Pagar y reservar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const tarjeta = {
          numero: document.getElementById("swal-card-number")?.value.trim(),
          nombre: document.getElementById("swal-card-name")?.value.trim(),
          apellido: document.getElementById("swal-card-lastname")?.value.trim(),
          vencimiento: document.getElementById("swal-card-expiration")?.value.trim(),
          cvv: document.getElementById("swal-card-cvv")?.value.trim(),
        };

        if (
          !tarjeta.numero ||
          !tarjeta.nombre ||
          !tarjeta.apellido ||
          !tarjeta.vencimiento ||
          !tarjeta.cvv
        ) {
          Swal.showValidationMessage("Completá todos los datos de la tarjeta");
          return false;
        }

        return tarjeta;
      },
    });

    return tarjetaDebito || null;
  }

  async function handleReservaNoAbonado() {
    if (cuposFecha <= 0) {
      await ejecutarAccion(
        () => crearReserva({ turno_id: turno.id, fecha: fechaClase }),
        "Solicitud procesada"
      );
      return;
    }

    const tarjetaDebito = await solicitarTarjetaSena();

    if (!tarjetaDebito) return;

    await ejecutarAccion(
      () => crearReserva({ turno_id: turno.id, fecha: fechaClase, tarjetaDebito }),
      "Reserva procesada"
    );
  }

  async function handleCancelarClaseAbonado() {
    await ejecutarAccion(
      () => cancelarClaseAbonado({ turno_id: turno.id, fecha: fechaClase }),
      "Clase cancelada"
    );
  }

  async function handleAltaAbonado() {
    await ejecutarAccion(() => altaAbonadoTurno(turno.id), "Solicitud de abono procesada");
  }

  async function handleBajaAbonado() {
    await ejecutarAccion(() => bajaAbonadoTurno(turno.id), "Abono dado de baja");
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
            {esCliente && !esAbonadoActivo && (
              <button
                className="btn-primary"
                disabled={saving || Boolean(estadoReservaPuntual)}
                onClick={handleReservaNoAbonado}
              >
                {estadoReservaPuntual === "RESERVADA" && "Clase ya reservada"}
                {estadoReservaPuntual === "CUPO_RESERVADO" && "Cupo reservado"}
                {estadoReservaPuntual === "EN_ESPERA" && "En cola"}
                {!estadoReservaPuntual && "Reservar clase"}
              </button>
            )}
            {esCliente && esAbonadoActivo && (
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
            {esCliente && !esAbonadoActivo && (
              <button className="btn-primary" disabled={saving} onClick={handleAltaAbonado}>
                Abonarme al turno
              </button>
            )}
            {esCliente && esAbonadoActivo && (
              <button className="btn-secondary" disabled={saving} onClick={handleBajaAbonado}>
                Darme de baja del abono
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
