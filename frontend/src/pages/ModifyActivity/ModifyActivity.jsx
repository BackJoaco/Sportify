import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getActividadById, updateActividad } from "../../api/actividad.api";
// Importa el mismo CSS que usas para el registro, o renómbralo

export default function ModifyActivity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [precioClase, setPrecioClase] = useState("");
  const [precioMensual, setPrecioMensual] = useState("");

  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar datos iniciales
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

  const isDirty = originalData && (
    nombre !== originalData.nombre ||
    Number(precioClase).toFixed(2) !== Number(originalData.precio_clase).toFixed(2) ||
    Number(precioMensual).toFixed(2) !== Number(originalData.precio_mensual).toFixed(2)
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isDirty) {
      setError("Los cambios no se guardaron. No se detectaron modificaciones en los datos de la actividad.");
      return;
    }

    setSaving(true);

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
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="register-container">
        <div style={{ padding: "2rem", textAlign: "center", color: "#1A2F50" }}>
          Cargando datos de la actividad...
        </div>
      </main>
    );
  }

  return (
    <main className="register-container">
      <section className="register-panel">

        <div className="panel-header">
          <h1>Modificar actividad</h1>
          <p>Edita los datos de la actividad seleccionada.</p>
        </div>

        <div className="register-form-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="form-stack">

              <div className="form-group">
                <label>NOMBRE DE LA ACTIVIDAD</label>
                <input
                  type="text"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>PRECIO POR CLASE</label>
                  <div className="ma-input-group">
                    <span className="ma-input-prefix">$</span>
                    <input
                      type="number"
                      name="precioClase"
                      value={precioClase}
                      onChange={(e) => setPrecioClase(e.target.value)}
                      step="0.01"
                      min="1"
                      disabled={saving}
                      required
                    />
                  </div>

                </div>
                <div className="form-group">
                  <label>PRECIO MENSUAL</label>
                  <div className="ma-input-group">
                    <span className="ma-input-prefix">$</span>
                    <input
                      type="number"
                      name="precioMensual"
                      value={precioMensual}
                      onChange={(e) => setPrecioMensual(e.target.value)}
                      step="0.01"
                      min="1"
                      disabled={saving}
                      required
                    />
                  </div>

                </div>
              </div>

            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/actividades")}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}
