import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FaTimes } from "react-icons/fa";
import "./QRScannerModal.css";

export default function QRScannerModal({ open, onClose, onScanSuccess }) {
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  const handleScan = async (result) => {
    if (result && result.length > 0 && !processing) {
      setProcessing(true);
      const codigo = result[0].rawValue;
      await onScanSuccess(codigo);
      // setProcessing back to false if you want continuous scanning, 
      // but usually the modal closes on success.
      setProcessing(false);
    }
  };

  const handleError = (error) => {
    console.warn("QR Scanner error:", error);
  };

  return (
    <div className="qr-scanner-backdrop" onClick={onClose} role="presentation">
      <div 
        className="qr-scanner-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
      >
        <button className="qr-scanner-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <FaTimes />
        </button>
        
        <div className="qr-scanner-header">
          <h2>Escanear QR de Asistencia</h2>
          <p>Enfoca el código del cliente dentro del recuadro.</p>
        </div>

        <div className="qr-scanner-body">
          <Scanner 
            onScan={handleScan} 
            onError={handleError}
            components={{ audio: false }}
          />
          {processing && (
            <div className="qr-scanner-overlay">
              <p>Procesando...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
