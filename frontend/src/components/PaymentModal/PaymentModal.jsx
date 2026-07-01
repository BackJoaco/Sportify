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
  onClose,
  onSubmit,
}) {
  const [tarjeta, setTarjeta] = useState(estadoInicialTarjeta);

  useEffect(() => {
    if (!open) {
      setTarjeta(estadoInicialTarjeta);
    }
  }, [open]);

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

        <form className="payment-modal-form" onSubmit={handleSubmit}>
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
              <p>Realizando pago...</p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}