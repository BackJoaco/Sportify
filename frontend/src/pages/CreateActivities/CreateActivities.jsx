import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createActividad } from "../../api/actividad.api";
import "./CreateActivities.css";

export default function CreateActivities() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: "",
        precio_clase: "",
        precio_mensual: ""
    });

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const datosAEnviar = {
                nombre: formData.nombre.trim(),
                precio_clase: parseFloat(formData.precio_clase),
                precio_mensual: parseFloat(formData.precio_mensual)
            };
            console.log(datosAEnviar);
            await createActividad(datosAEnviar);

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Actividad creada exitosamente',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
            
            navigate("/actividades");
        } catch (err) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: err.message || 'Error al crear la actividad',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        navigate("/actividades");
    }

    return (
        <div className="create-activity-container">
            <div className="create-activity-card">
                <h1>Nueva Actividad</h1>
                
                <form onSubmit={handleSubmit} className="activity-form">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre de la actividad</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            required
                            maxLength="50"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="precio_clase">Precio por Clase ($)</label>
                        <input
                            type="number"
                            id="precio_clase"
                            name="precio_clase"
                            value={formData.precio_clase}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="precio_mensual">Precio Mensual ($)</label>
                        <input
                            type="number"
                            id="precio_mensual"
                            name="precio_mensual"
                            value={formData.precio_mensual}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="activity-actions">
                        <button 
                            type="submit" 
                            className="btn-save"
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Crear Actividad"}
                        </button>
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}