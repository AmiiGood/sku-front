import React, { useState, useEffect } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import Pagination from "../common/Pagination";

const LogsSection = () => {
  const { request } = useApi();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await request(`/api/logs?${params}`);
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (error) {
      console.error("Error loading logs:", error);
      setLogs([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este log?")) {
      try {
        await request(`/api/logs/${id}`, { method: "DELETE" });
        // Recargar la página actual después de eliminar
        loadLogs(currentPage);
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    }
  };

  const handleRefresh = () => {
    loadLogs(currentPage);
  };

  return (
    <div>
      <div className="header">
        <h1>Logs del Sistema</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando logs...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      No hay logs registrados
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>Usuario {log.usuario_id}</td>
                      <td>{log.accion}</td>
                      <td>{new Date(log.fecha).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(log.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default LogsSection;
