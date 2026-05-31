import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  FaArrowLeft, 
  FaUser, 
  FaChevronDown, 
  FaSave, 
  FaInfoCircle, 
  FaTimes,
  FaTimesCircle
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { getActividadById, updateActividad } from "../../api/actividad.api";
import "./ModifyActivity.css";

export default function ModifyActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [nombre, setNombre] = useState("");
  const [precioClase, setPrecioClase] = useState("");
  const [precioMensual, setPrecioMensual] = useState("");
  
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Cargar datos iniciales de la actividad
  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        const data = await getActividadById(id);
        setNombre(data.nombre);
        setPrecioClase(Number(data.precio_clase).toFixed(2));
        setPrecioMensual(Number(data.precio_mensual).toFixed(2));
        setOriginalData(data);
      } catch (err) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: err.message || "Error al cargar la actividad",
          showConfirmButton: false,
          timer: 3000
        });
        navigate("/actividades");
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [id, navigate]);

  // Verificar si hay cambios en el formulario comparando con los datos cargados
  const isDirty = originalData && (
    nombre !== originalData.nombre ||
    Number(precioClase).toFixed(2) !== Number(originalData.precio_clase).toFixed(2) ||
    Number(precioMensual).toFixed(2) !== Number(originalData.precio_mensual).toFixed(2)
  );

  // Manejar el submit para guardar los cambios (Escenario 1)
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setShowAlert(false);

    try {
      const datosActualizados = {
        nombre: nombre.trim(),
        precio_clase: parseFloat(precioClase),
        precio_mensual: parseFloat(precioMensual)
      };

      await updateActividad(id, datosActualizados);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Actividad modificada exitosamente",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });

      navigate("/actividades");
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Error al guardar los cambios",
        showConfirmButton: false,
        timer: 3500
      });
    } finally {
      setSaving(false);
    }
  }

  // Manejar la navegación de salida y advertencia (Escenarios 2 y 3)
  function handleCancelOrBack() {
    if (isDirty) {
      if (showAlert) {
        // Si el banner ya está visible y presionan Cancelar por segunda vez, proceden a salir (Escenario 2)
        navigate("/actividades");
      } else {
        // Informar que los datos no se guardaron mostrando el banner (Escenario 3)
        setShowAlert(true);
      }
    } else {
      // Si no hay cambios, sale directamente
      navigate("/actividades");
    }
  }

  if (loading) {
    return <div className="ma-loading">Cargando datos de la actividad...</div>;
  }

  const username = usuario?.nombre || "maxi";

  return (
    <div className="ma-shell">
      {/* Navbar superior idéntica a la maqueta */}
      <nav className="ma-navbar">
        <div className="ma-navbar-brand">
          <strong className="ma-brand-logo">Sportify</strong>
          <span className="ma-role-pill">ADMINISTRADOR</span>
        </div>
        <div className="ma-user-menu">
          <div className="ma-avatar">
            <FaUser className="ma-user-icon" />
          </div>
          <span className="ma-user-name">{username}</span>
          <FaChevronDown className="ma-chevron-icon" />
        </div>
      </nav>

      {/* Área del contenido */}
      <main className="ma-content-area">
        {/* Banner de alerta si no se guardaron los cambios (Escenario 3) */}
        {showAlert && (
          <div className="ma-alert-banner">
            <div className="ma-alert-left">
              <FaTimesCircle className="ma-alert-icon-error" />
              <div className="ma-alert-texts">
                <strong>Los cambios no se guardaron</strong>
                <span>
                  No se actualizaron los datos de la actividad "{originalData?.nombre}". Debes guardar los cambios para que se apliquen.
                </span>
              </div>
            </div>
            <button 
              className="ma-alert-close" 
              onClick={() => setShowAlert(false)}
              title="Cerrar advertencia"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Tarjeta del Formulario de Modificación */}
        <section className="ma-card">
          <div className="ma-card-header">
            <button 
              className="ma-btn-back" 
              onClick={handleCancelOrBack}
              title="Volver"
            >
              <FaArrowLeft />
            </button>
            <div className="ma-header-titles">
              <h1>Modificar actividad</h1>
              <p>Edita los datos de la actividad seleccionada.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="ma-form">
            {/* Nombre de la actividad */}
            <div className="ma-form-group">
              <label htmlFor="nombre">
                Nombre de la actividad <span className="ma-required">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength="50"
                placeholder="Ej. Fútbol"
              />
              <span className="ma-input-hint">
                Nombre con el que se identifica la actividad.
              </span>
            </div>

            {/* Precio por clase */}
            <div className="ma-form-group">
              <label htmlFor="precio_clase">
                Precio por clase ($) <span className="ma-required">*</span>
              </label>
              <div className="ma-input-group">
                <span className="ma-input-prefix">$</span>
                <input
                  type="number"
                  id="precio_clase"
                  value={precioClase}
                  onChange={(e) => setPrecioClase(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <span className="ma-input-hint">
                Precio que se cobra por cada clase.
              </span>
            </div>

            {/* Precio mensual */}
            <div className="ma-form-group">
              <label htmlFor="precio_mensual">
                Precio mensual ($) <span className="ma-required">*</span>
              </label>
              <div className="ma-input-group">
                <span className="ma-input-prefix">$</span>
                <input
                  type="number"
                  id="precio_mensual"
                  value={precioMensual}
                  onChange={(e) => setPrecioMensual(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <span className="ma-input-hint">
                Precio que se cobra por la mensualidad.
              </span>
            </div>

            {/* Acciones */}
            <div className="ma-form-actions">
              <button 
                type="button" 
                className="ma-btn-secondary" 
                onClick={handleCancelOrBack}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="ma-btn-primary" 
                disabled={saving}
              >
                <FaSave className="ma-save-icon" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>

          {/* Caja Informativa */}
          <div className="ma-info-box">
            <FaInfoCircle className="ma-info-icon" />
            <div className="ma-info-content">
              <strong>Recuerda</strong>
              <p>Debes guardar los cambios para que se actualicen los datos de la actividad.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
