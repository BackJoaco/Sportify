import "./NotificationModal.css";

export default function NotificationModal({ isOpen, onClose, notification }) {
  if (!isOpen || !notification) return null;

  function formatFecha(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="notif-modal-backdrop" onClick={onClose}>
      <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal-header">
          <h2>Detalle de Notificación</h2>
          <span className={`notif-modal-badge ${notification.leida ? "leida" : "no-leida"}`}>
            {notification.leida ? "Leída" : "Nueva"}
          </span>
        </div>

        <div className="notif-modal-body">
          <p className="notif-modal-message">{notification.mensaje}</p>
          <span className="notif-modal-date">{formatFecha(notification.fecha_creacion)}</span>
        </div>

        <div className="notif-modal-footer">
          <button className="notif-modal-close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
