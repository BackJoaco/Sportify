import React from "react";
import QRCode from "react-qr-code";
import { FaTimes } from "react-icons/fa";
import "./QRModal.css";

export default function QRModal({ open, qrData, onClose }) {
  if (!open) return null;

  return (
    <div className="qr-modal-backdrop" onClick={onClose} role="presentation">
      <div 
        className="qr-modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
      >
        <button className="qr-modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <FaTimes />
        </button>
        <div className="qr-modal-header">
          <h2>Código QR de Ingreso</h2>
          <p>Presentá este código en recepción para ingresar a la clase.</p>
        </div>
        <div className="qr-modal-body">
          {qrData ? (
            <div className="qr-container">
              <QRCode value={qrData} size={256} />
            </div>
          ) : (
            <div className="qr-error">
              <p>No se pudo cargar el código QR.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
