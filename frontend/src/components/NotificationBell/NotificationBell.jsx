import { useState, useEffect, useRef } from "react";
import { FaBell, FaCheckDouble, FaTrashAlt } from "react-icons/fa";
import { getMisNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from "../../api/notificacion.api";
import NotificationModal from "../NotificationModal/NotificationModal";
import "./NotificationBell.css";

export default function NotificationBell() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  async function cargarNotificaciones() {
    try {
      const data = await getMisNotificaciones();
      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.no_leidas || 0);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  }

  // Polling y carga inicial
  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 20000); // cada 20 segundos
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarcarComoLeida(id, e) {
    if (e) e.stopPropagation();
    try {
      await marcarComoLeida(id);
      setNotificaciones((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  }

  async function handleVerNotificacion(notif, e) {
    if (e) e.stopPropagation();
    setSelectedNotif(notif);
    setIsModalOpen(true);

    if (!notif.leida) {
      try {
        await marcarComoLeida(notif.id);
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
        );
        setSelectedNotif((prev) => (prev ? { ...prev, leida: true } : null));
        setNoLeidas((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error al marcar como leída al abrir modal:", error);
      }
    }
  }

  async function handleMarcarTodasComoLeidas() {
    try {
      await marcarTodasComoLeidas();
      setNotificaciones((prev) => prev.map((notif) => ({ ...notif, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  }

  function formatFecha(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones"
      >
        <FaBell />
        {noLeidas > 0 && <span className="notif-badge">{noLeidas}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notificaciones</h3>
            {noLeidas > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={handleMarcarTodasComoLeidas}
                title="Marcar todas como leídas"
              >
                <FaCheckDouble /> Marcar todo leído
              </button>
            )}
          </div>

          <div className="notif-list">
            {notificaciones.length === 0 ? (
              <div className="notif-empty">No tienes notificaciones</div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${notif.leida ? "leida" : "no-leida"}`}
                  onClick={(e) => handleVerNotificacion(notif, e)}
                >
                  <div className="notif-content">
                    <p className="notif-message">{notif.mensaje}</p>
                    <span className="notif-date">{formatFecha(notif.createdAt)}</span>
                  </div>
                  {!notif.leida && (
                    <button
                      className="notif-mark-read-btn"
                      onClick={(e) => handleMarcarComoLeida(notif.id, e)}
                      title="Marcar como leída"
                    >
                      <span className="notif-unread-dot"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotif(null);
        }}
        notification={selectedNotif}
      />
    </div>
  );
}
