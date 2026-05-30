import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarios, deleteEmployee } from "../../../api/usuario.api";
import Swal from "sweetalert2";
import "./AdminHome.css";

export default function AdminHome() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (usuario) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará permanentemente a ${usuario.nombre} ${usuario.apellido}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E5BF0",
      cancelButtonColor: "#7F8C8D",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteEmployee(usuario.id);
        setUsuarios(usuarios.filter((u) => u.id !== usuario.id));
        Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const usuariosFiltrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usuariosPorPagina = 4;
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const indiceUltimo = currentPage * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosPaginaActual = usuariosFiltrados.slice(indicePrimero, indiceUltimo);

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 || 
        i === totalPaginas || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <main className="admin-home-container">
      <div className="admin-home-panel">
        <div className="header-actions">
          <div className="header-titles">
            <span>GESTIÓN DE USUARIOS</span>
            <h1>Usuarios</h1>
          </div>
          <div className="header-controls">
            <input
              type="text"
              placeholder="Buscar por correo..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-add" onClick={() => navigate("/empleados/registrar")}>
              Agregar Empleado
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Correo electrónico</th>
                <th className="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="empty-state">Cargando usuarios...</td></tr>
              ) : usuariosPaginaActual.length > 0 ? (
                usuariosPaginaActual.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.rol}</td>
                    <td>{u.email}</td>
                    <td className="td-actions">
                      <button className="btn-delete" title="Eliminar" onClick={() => handleDelete(u)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-state">No hay usuarios cargados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="pagination-controls">
            <button className="btn-pagination" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt;</button>
            
            {renderPagination().map((page, index) => (
              page === "..." ? (
                <span key={index} className="pagination-dots">...</span>
              ) : (
                <button
                  key={index}
                  className={`btn-pagination ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            ))}

            <button className="btn-pagination" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))} disabled={currentPage === totalPaginas}>&gt;</button>
          </div>
        )}
      </div>
    </main>
  );
}