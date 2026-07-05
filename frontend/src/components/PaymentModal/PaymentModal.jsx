import { useEffect, useState } from "react";
import "./PaymentModal.css";

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

const estadoInicialTarjeta = {
  numero: "1234123412341234",
  nombre: "cliente",
  apellido: "cliente",
  vencimiento: "09/30",
  cvv: "123",
};

export default function PaymentModal({
  open,
  title,
  subtitle,
  amount,
  amountLabel = "Monto",
  confirmLabel = "Confirmar pago",
  cancelLabel = "Cancelar",
  loading = false,
  isSena = false, 
  onPayWithCredit, 
  onClose,
  onSubmit,
}) {
  const [tarjeta, setTarjeta] = useState(estadoInicialTarjeta);

  useEffect(() => {
    if (!open) {
      setTarjeta(estadoInicialTarjeta);
    } else {
      // Si abrimos el modal, es una clase suelta y tiene créditos, le mostramos la selección primero
      if (isSena) {
        setView("SELECTION");
      } else {
        setView("CARD");
      }
    }
  }, [open, isSena]);

  if (!open) {
    return null;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setTarjeta((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit?.(tarjeta);
  }

  return (
    <div className="payment-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="payment-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="payment-modal-header">
          <div>
            <span className="payment-modal-kicker">{amountLabel}</span>
            <h2 id="payment-modal-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <strong>{formatearMonto(amount)}</strong>
        </div>

        {/* RENDERIZADO CONDICIONAL DE LA VISTA DEL MODAL */}
        {view === "SELECTION" ? (
          
          /* --- VISTA 1: SELECCIÓN DE MÉTODO DE PAGO --- */
          <div className="payment-modal-selection" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
            <div style={{ padding: "1rem", backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #a5d6a7", textAlign: "center" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#2e7d32", fontSize: "1.1rem" }}>
                <strong>Pagar con Crédito</strong>
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#2e7d32" }}>
                Si poseés créditos a tu favor, podés usar uno para confirmar tu lugar.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={onPayWithCredit}
              disabled={loading}
              style={{ backgroundColor: "#2e7d32", borderColor: "#1b5e20", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "0.8rem", color: "white" }}
            >
              <FaTicketAlt /> {loading ? "Procesando..." : "Usar un Crédito"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setView("CARD")}
              disabled={loading}
              style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "0.8rem" }}
            >
              <FaCreditCard /> Continuar con Tarjeta
            </button>
          </div>

        ) : (

          /* --- VISTA 2: FORMULARIO DE TARJETA ORIGINAL --- */
          <form className="payment-modal-form" onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            
            {/* Botón para volver a la selección si se arrepiente (solo aparece si tiene créditos) */}
            {isSena && (
              <button 
                type="button" 
                onClick={() => setView("SELECTION")} 
                style={{ background: "none", border: "none", color: "#1E5BF0", cursor: "pointer", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem", padding: 0, fontWeight: "bold" }}
              >
                <FaArrowLeft /> Volver a opciones de pago
              </button>
            )}

            <div className="form-group">
              <label htmlFor="numero">Numero de tarjeta</label>
              <input
                id="numero"
                name="numero"
                value={tarjeta.numero}
                onChange={handleChange}
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
                required
              />
            </div>

            <div className="payment-modal-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  value={tarjeta.nombre}
                  onChange={handleChange}
                  autoComplete="cc-given-name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  name="apellido"
                  value={tarjeta.apellido}
                  onChange={handleChange}
                  autoComplete="cc-family-name"
                  required
                />
              </div>
            </div>

            <div className="payment-modal-row">
              <div className="form-group">
                <label htmlFor="vencimiento">Vencimiento</label>
                <input
                  id="vencimiento"
                  name="vencimiento"
                  value={tarjeta.vencimiento}
                  onChange={handleChange}
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  name="cvv"
                  value={tarjeta.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  autoComplete="cc-csc"
                  required
                />
              </div>
            </div>

            <div className="payment-modal-actions">
              <button type="button" className="btn-payment-cancel" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </button>
              <button type="submit" className="btn-payment-submit" disabled={loading}>
                {loading ? "Procesando..." : confirmLabel}
              </button>
            </div>

            {loading ? (
              <div className="payment-modal-processing">
                <div className="payment-modal-spinner" />
                <p>Procesando operación...</p>
              </div>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}