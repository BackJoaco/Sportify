import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarDay, FaUserSlash, FaBan, FaHourglassEnd, FaFireAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  simularDias1a10,
  simularDia11,
  forzarCancelacion,
  simularExpiracion,
  simularAltaDemanda
} from "../../api/demo.api";
import "./DemoPanel.css";

export default function DemoPanel() {
  const navigate = useNavigate();
  const [turnoId, setTurnoId] = useState("");
  const [loading, setLoading] = useState({
    dias1a10: false,
    dia11: false,
    cancelacion: false,
    expiracion: false,
    demanda: false,
  });

  function handleLoading(key, value) {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSimularDias1a10() {
    handleLoading("dias1a10", true);
    try {
      const res = await simularDias1a10();
      Swal.fire({
        icon: "success",
        title: "Días 1 al 10 Simulado",
        text: `Proceso completado. Suscripciones procesadas: ${res.resultado.suscripcionesProcesadas || 0}, Notificaciones de pago creadas: ${res.resultado.notificacionesCreadas || 0}`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en Simulación",
        text: err.message || "No se pudo simular recordatorios de pago.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("dias1a10", false);
    }
  }

  async function handleSimularDia11() {
    handleLoading("dia11", true);
    try {
      const res = await simularDia11();
      Swal.fire({
        icon: "success",
        title: "Día 11 Simulado",
        text: `Suspensión de deudores completada. Suscripciones procesadas: ${res.suscripcionesProcesadas || 0}. Usuarios suspendidos: ${res.suspendidasCount || 0}. Se crearon las notificaciones correspondientes.`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en Simulación",
        text: err.message || "No se pudo simular las suspensiones.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("dia11", false);
    }
  }

  async function handleForzarCancelacion() {
    if (!turnoId.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Turno ID requerido",
        text: "Por favor ingresa un ID de turno válido para forzar la cancelación.",
        confirmButtonColor: "var(--blue)",
      });
      return;
    }

    handleLoading("cancelacion", true);
    try {
      const res = await forzarCancelacion(Number(turnoId));
      Swal.fire({
        icon: "success",
        title: "Cancelación Forzada",
        text: `Reserva cancelada ID: ${res.reservaCanceladaId}. Cupo asignado con prioridad de waitlist. Mensaje: ${res.flowResult?.message}`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en Simulación",
        text: err.message || "No hay reservas activas en el turno especificado.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("cancelacion", false);
    }
  }

  async function handleSimularExpiracion() {
    handleLoading("expiracion", true);
    try {
      const res = await simularExpiracion();
      Swal.fire({
        icon: "success",
        title: "Paso de 1 Hora Simulado",
        text: `Se vencieron los cupos reservados sin confirmar. Abonados expirados: ${res.abonadosExpirados}. No abonados expirados: ${res.noAbonadosExpirados}. Se asignaron cupos a los siguientes en cola de espera.`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en Simulación",
        text: err.message || "No se pudo simular la expiración de la lista.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("expiracion", false);
    }
  }

  async function handleSimularAltaDemanda() {
    if (!turnoId.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Turno ID requerido",
        text: "Por favor ingresa un ID de turno para inyectar demanda ficticia.",
        confirmButtonColor: "var(--blue)",
      });
      return;
    }

    handleLoading("demanda", true);
    try {
      await simularAltaDemanda(Number(turnoId));
      Swal.fire({
        icon: "success",
        title: "Alta Demanda Inyectada",
        text: `Se agregaron 10 usuarios ficticios a la lista de espera para el turno ID: ${turnoId}. Esto supera el límite de 10 personas en espera y disparó la alerta para los Administradores.`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en Simulación",
        text: err.message || "No se pudo simular el alta demanda.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("demanda", false);
    }
  }

  return (
    <div className="demo-panel-container">
      <div className="demo-panel-card">
        <div className="demo-panel-header">
          <button className="btn-back" onClick={() => navigate("/home")}>
            <FaArrowLeft /> Volver al inicio
          </button>
          <h1>Panel de Simulación (Modo Demo)</h1>
          <p className="demo-panel-desc">
            Espacio de simulación de eventos temporales y disparadores de reglas de negocio para la presentación del sistema.
          </p>
        </div>

        {/* Campo Turno ID requerido para algunas pruebas */}
        <div className="demo-input-section">
          <label htmlFor="demo-turno-id">ID de Turno de Referencia:</label>
          <input
            type="number"
            id="demo-turno-id"
            placeholder="Ej: 1, 2"
            value={turnoId}
            onChange={(e) => setTurnoId(e.target.value)}
          />
          <span className="input-helper">Requerido para liberar cupo e inyectar alta demanda.</span>
        </div>

        <div className="demo-actions-grid">
          {/* Acción 1 */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaCalendarDay className="demo-icon" />
              <div>
                <h3>Simular Días 1 al 10</h3>
                <p>Envía notificaciones de recordatorio de pago a abonados con cuotas pendientes en el mes actual.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleSimularDias1a10}
              disabled={loading.dias1a10}
            >
              {loading.dias1a10 ? "Procesando..." : "Simular Recordatorios"}
            </button>
          </div>

          {/* Acción 2 */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaUserSlash className="demo-icon" />
              <div>
                <h3>Simular Día 11</h3>
                <p>Suspende la cuenta de abonados morosos, da de baja sus turnos fijos y los notifica automáticamente.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleSimularDia11}
              disabled={loading.dia11}
            >
              {loading.dia11 ? "Procesando..." : "Suspender deudores"}
            </button>
          </div>

          {/* Acción 3 */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaBan className="demo-icon" />
              <div>
                <h3>Forzar Cancelación (Liberar Cupo)</h3>
                <p>Busca una reserva confirmada para el Turno de Referencia y la cancela, habilitando el cupo para la waitlist por 1 hora.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleForzarCancelacion}
              disabled={loading.cancelacion}
            >
              {loading.cancelacion ? "Procesando..." : "Liberar Cupo"}
            </button>
          </div>

          {/* Acción 4 */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaHourglassEnd className="demo-icon" />
              <div>
                <h3>Simular Paso de 1 Hora</h3>
                <p>Expira las reservas temporales de lista de espera que cumplieron 1 hora y reasigna el cupo al siguiente en cola.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleSimularExpiracion}
              disabled={loading.expiracion}
            >
              {loading.expiracion ? "Procesando..." : "Simular paso de 1 hora"}
            </button>
          </div>

          {/* Acción 5 */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaFireAlt className="demo-icon text-danger" />
              <div>
                <h3>Inyectar Alta Demanda</h3>
                <p>Inscribe a 10 usuarios ficticios en la lista de espera del Turno de Referencia, disparando la alerta a los administradores.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleSimularAltaDemanda}
              disabled={loading.demanda}
            >
              {loading.demanda ? "Procesando..." : "Inyectar demanda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
