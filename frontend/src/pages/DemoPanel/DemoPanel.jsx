import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarDay, FaUserSlash, FaBan, FaHourglassEnd, FaFireAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  forzarCancelacion,
  generarCreditoAVencer,
  expirarCreditoDemo,
  resetDatabase
} from "../../api/demo.api";
import "./DemoPanel.css";

export default function DemoPanel() {
  const navigate = useNavigate();
  const [turnoId, setTurnoId] = useState("");
  const [loading, setLoading] = useState({
    cancelacion: false,
    credito: false,
    expirar: false,
    resetDb: false,
  });

  function handleLoading(key, value) {
    setLoading((prev) => ({ ...prev, [key]: value }));
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

  async function handleGenerarCredito() {
    handleLoading("credito", true);
    try {
      const res = await generarCreditoAVencer();
      Swal.fire({
        icon: "success",
        title: "Crédito Generado",
        text: `Se generó el crédito con fecha de vencimiento: ${new Date(res.fecha_vencimiento).toLocaleString()}`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al generar crédito",
        text: err.message || "No se pudo generar el crédito.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("credito", false);
    }
  }

  async function handleExpirarCredito() {
    handleLoading("expirar", true);
    try {
      const res = await expirarCreditoDemo();
      Swal.fire({
        icon: "success",
        title: "Crédito Expirado (Pasado)",
        text: `El crédito ahora tiene fecha de vencimiento: ${new Date(res.credito.fecha_vencimiento).toLocaleString()}`,
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al expirar crédito",
        text: err.message || "No se pudo expirar el crédito.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("expirar", false);
    }
  }

  async function handleResetDatabase() {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto eliminará todas las tablas, recreará la base de datos y ejecutará el seed inicial. ¡Esta acción es destructiva!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4757",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, reiniciar y seedear",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    handleLoading("resetDb", true);
    try {
      const res = await resetDatabase();
      Swal.fire({
        icon: "success",
        title: "Base de Datos Reiniciada",
        text: res.message || "Se recreó la estructura de la base de datos y se aplicaron las semillas correctamente.",
        confirmButtonColor: "var(--blue)",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al reiniciar",
        text: err.message || "Hubo un problema al procesar la solicitud.",
        confirmButtonColor: "var(--blue)",
      });
    } finally {
      handleLoading("resetDb", false);
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
          {/* Acción 1: Liberar Cupo */}
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

          {/* Acción 2: Generar Crédito a Vencer */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaHourglassEnd className="demo-icon" />
              <div>
                <h3>Generar Crédito a Vencer</h3>
                <p>Crea un crédito disponible con fecha de vencimiento configurada para el día de hoy.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleGenerarCredito}
              disabled={loading.credito}
            >
              {loading.credito ? "Procesando..." : "Generar Crédito"}
            </button>
          </div>

          {/* Acción 3: Expirar Crédito */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaCalendarDay className="demo-icon" />
              <div>
                <h3>Expirar Crédito (Simular paso de 1 día)</h3>
                <p>Busca el crédito disponible del usuario 2 y cambia su fecha de vencimiento al día de ayer.</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleExpirarCredito}
              disabled={loading.expirar}
            >
              {loading.expirar ? "Procesando..." : "Expirar Crédito"}
            </button>
          </div>

          {/* Acción 4: Reiniciar Base de Datos */}
          <div className="demo-action-item">
            <div className="demo-action-info">
              <FaFireAlt className="demo-icon text-danger" />
              <div>
                <h3>Restablecer Base de Datos (Limpiar y Seedear)</h3>
                <p>Borra todas las tablas de la base de datos, las vuelve a crear e inyecta los datos iniciales de prueba (seed).</p>
              </div>
            </div>
            <button
              className="btn-danger"
              onClick={handleResetDatabase}
              disabled={loading.resetDb}
            >
              {loading.resetDb ? "Restableciendo..." : "Restablecer Base de Datos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
