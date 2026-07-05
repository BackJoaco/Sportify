import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaCreditCard } from "react-icons/fa";
import Swal from "sweetalert2";
import { aplicarCreditoClase } from "../../api/pago.api";
import { getMisCreditos } from "../../api/credito.api"; // Asumiendo que tenés esta función

export default function CheckoutReserva({ reserva, clase }) {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [loadingPago, setLoadingPago] = useState(false);

  // Simulamos la carga de los créditos del usuario al entrar a la pantalla
  useEffect(() => {
    async function cargarCreditos() {
      try {
        const misCreditos = await getMisCreditos();
        setCreditos(misCreditos.data);
        
        // Mock para el ejemplo: El usuario tiene 1 crédito disponible
        setCreditos([
          { id: 1, estado: "DISPONIBLE", fecha_vencimiento: "2026-08-10" }
        ]);
      } catch (error) {
        console.error("Error al cargar créditos");
      }
    }
    cargarCreditos();
  }, []);

  const handlePagarConCredito = async () => {
    // Tomamos el primer crédito disponible de la lista
    const creditoAUsar = creditos.find(c => c.estado === "DISPONIBLE");

    if (!creditoAUsar) return;

    try {
      setLoadingPago(true);

      const payload = {
        creditoId: creditoAUsar.id,
        reservaId: reserva.id, // El ID de la reserva que generaste previamente
        montoClase: clase.precio_clase,
        tipoPago: "CLASE_COMPLETA"
      };

      await aplicarCreditoClase(payload);

      // Si todo sale bien, mostramos el éxito y lo mandamos a su calendario
      Swal.fire({
        icon: "success",
        title: "¡Clase pagada!",
        text: "Utilizaste un crédito a tu favor. Tu lugar está 100% confirmado.",
        confirmButtonColor: "#1E5BF0",
      }).then(() => {
        navigate("/mi-calendario"); // O la ruta a donde quieras redirigirlo
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Ups...",
        text: error.message || "No se pudo aplicar el crédito.",
      });
    } finally {
      setLoadingPago(false);
    }
  };

  const handlePagarMercadoPago = () => {
    // Tu lógica habitual para redirigir a Mercado Pago
    console.log("Redirigiendo a Mercado Pago...");
  };

  return (
    <div className="checkout-container">
      <h2>Confirmar y Pagar Clase</h2>
      
      <div className="resumen-clase">
        <p><strong>Actividad:</strong> {clase.nombre}</p>
        <p><strong>Total a pagar:</strong> ${clase.precio_clase}</p>
      </div>

      <div className="acciones-pago" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
        
        {/* RENDERIZADO CONDICIONAL: Solo aparece si tiene al menos 1 crédito */}
        {creditos.length > 0 && (
          <div className="credito-banner" style={{ padding: "1rem", backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #a5d6a7" }}>
            <p style={{ margin: "0 0 0.5rem 0", color: "#2e7d32" }}>
              <strong>¡Tenés {creditos.length} crédito(s) a tu favor!</strong>
            </p>
            <button 
              className="btn-primary" 
              onClick={handlePagarConCredito}
              disabled={loadingPago}
              style={{ backgroundColor: "#2e7d32", width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
            >
              <FaTicketAlt /> {loadingPago ? "Procesando..." : "Usar un Crédito para Pagar"}
            </button>
          </div>
        )}

        {/* Botón tradicional de pago */}
        <button 
          className="btn-primary" 
          onClick={handlePagarMercadoPago}
          disabled={loadingPago}
          style={{ width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
        >
          <FaCreditCard /> Pagar con Mercado Pago
        </button>

      </div>
    </div>
  );
}