import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaSearch, FaUserPlus, FaArrowLeft } from "react-icons/fa";
import { getUsuarios, deleteEmployee } from "../../api/usuario.api.js";
import "./UserManagement.css";

const PAGE_SIZE = 4;

export default function UserManagement() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal de confirmación / información
  const [modal, setModal] = useState(null);
  // modal = { type: "confirm", usuario } | { type: "info", message } | null

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }

  // ── Filtro y paginación ───────────────────────────────────────────────────
  const filtrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtrados.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  // ── Acciones de eliminación ───────────────────────────────────────────────
  function handleDeleteClick(usuario) {
    if (usuario.rol === "CLIENTE") {
      setModal({ type: "info", message: "La eliminación de clientes no está implementada todavía." });
    } else {
      setModal({ type: "confirm", usuario });
    }
  }

  async function handleConfirmDelete() {
    const usuario = modal.usuario;
    setModal(null);
    try {
      await deleteEmployee(usuario.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
    } catch (err) {
      setModal({ type: "info", message: err.message || "Error al eliminar el usuario" });
    }
  }

  // ── Paginación ────────────────────────────────────────────────────────────
  function buildPages() {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  return (
    <main className="um-container">
      {/* Botón Volver */}
      <button className="um-btn-back" onClick={() => navigate("/admin/home")}>
        <FaArrowLeft /> Volver al Panel Admin
      </button>

      {/* Encabezado */}
      <section className="um-header">
        <div className="um-title-block">
          <span className="um-kicker">GESTIÓN DE USUARIOS</span>
          <h1>Usuarios</h1>
        </div>


        <div className="um-header-actions">
          <div className="um-search-wrapper">
            <FaSearch className="um-search-icon" />
            <input
              id="um-search"
              type="text"
              className="um-search"
              placeholder="Buscar por correo..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button
            id="um-btn-agregar"
            className="um-btn-primary"
            onClick={() => navigate("/empleados/registrar")}
          >
            <FaUserPlus />
            Agregar Empleado
          </button>
        </div>
      </section>

      {/* Tabla */}
      <section className="um-table-section">
        {loading && <p className="um-status">Cargando usuarios...</p>}
        {error && <p className="um-status um-error">{error}</p>}

        {!loading && !error && (
          <table className="um-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Correo electrónico</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="um-empty">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                paginated.map((u) => (
                  <tr key={u.id} className="um-row">
                    <td className="um-cell-name">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className={`um-cell-rol um-rol-${u.rol?.toLowerCase()}`}>
                      {u.rol}
                    </td>
                    <td className="um-cell-email">{u.email}</td>
                    <td className="um-cell-actions">
                      <button
                        id={`um-delete-${u.id}`}
                        className="um-btn-delete"
                        title="Eliminar usuario"
                        onClick={() => handleDeleteClick(u)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Paginación */}
      {!loading && !error && totalPages > 1 && (
        <div className="um-pagination">
          <button
            className="um-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {buildPages().map((p) => (
            <button
              key={p}
              className={`um-page-btn ${p === currentPage ? "um-page-active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="um-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Modal de confirmación (EMPLEADO) */}
      {modal?.type === "confirm" && (
        <div className="um-modal-overlay" onClick={() => setModal(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar empleado</h2>
            <p>
              ¿Estás seguro de que querés eliminar a{" "}
              <strong>
                {modal.usuario.nombre} {modal.usuario.apellido}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="um-modal-actions">
              <button className="um-btn-cancel" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className="um-btn-confirm" onClick={handleConfirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal informativo (CLIENTE — no implementado) */}
      {modal?.type === "info" && (
        <div className="um-modal-overlay" onClick={() => setModal(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Acción no disponible</h2>
            <p>{modal.message}</p>
            <div className="um-modal-actions">
              <button className="um-btn-primary" onClick={() => setModal(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
