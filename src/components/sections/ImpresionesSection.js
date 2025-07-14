import React, { useState, useEffect } from "react";
import { Printer, Calendar, User, Package } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToastContext } from "../../contexts/ToastContext";
import Pagination from "../common/Pagination";
import SearchInput from "../common/SearchInput";
import ThemeSelector from "../common/ThemeSelector";

const ImpresionesSection = () => {
  const { request } = useApi();
  const toast = useToastContext();
  const [impresiones, setImpresiones] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    articulo_id: "",
    usuario_id: "",
  });

  const loadImpresiones = async (page = 1, perPage = itemsPerPage) => {
    try {
      setLoading(true);

      // Use the perPage parameter with fallback to 15 if still undefined
      const limit = perPage || 15;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filtros).filter(([key, value]) => value !== "")
        ),
      });

      const response = await request(`/api/impresiones?${params}`);
      setImpresiones(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (error) {
      console.error("Error loading impresiones:", error);
      toast.error("Error al cargar el historial de impresiones", 5000);
      // Establecer valores por defecto en caso de error
      setImpresiones([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filtros).filter(([key, value]) => value !== "")
        )
      );

      const response = await request(`/api/impresiones/estadisticas?${params}`);
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error loading estadísticas:", error);
      setEstadisticas([]);
    }
  };

  useEffect(() => {
    loadImpresiones(currentPage, itemsPerPage);
    loadEstadisticas();
  }, [currentPage, filtros, itemsPerPage]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_inicio: "",
      fecha_fin: "",
      articulo_id: "",
      usuario_id: "",
    });
    setCurrentPage(1);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularTotales = () => {
    const totalImpresiones = estadisticas.reduce(
      (sum, stat) => sum + parseInt(stat.total_impresiones),
      0
    );
    const totalEtiquetas = estadisticas.reduce(
      (sum, stat) => sum + parseInt(stat.total_etiquetas),
      0
    );
    const promedioEtiquetas =
      totalImpresiones > 0 ? (totalEtiquetas / totalImpresiones).toFixed(1) : 0;

    return { totalImpresiones, totalEtiquetas, promedioEtiquetas };
  };

  const totales = calcularTotales();

  return (
    <div>
      <div className="header">
        <h1>Historial de Impresiones</h1>
        <div className="header-actions">
          {/* Aquí podrías agregar controles adicionales si los necesitas */}
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3>Resumen General</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "var(--primary-50)",
              borderRadius: "8px",
            }}
          >
            <Printer
              size={24}
              style={{ color: "var(--primary-600)", marginBottom: "0.5rem" }}
            />
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--primary-600)",
              }}
            >
              {totales.totalImpresiones}
            </div>
            <div style={{ color: "var(--gray-600)" }}>Total Impresiones</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "var(--success-50)",
              borderRadius: "8px",
            }}
          >
            <Package
              size={24}
              style={{ color: "var(--success-600)", marginBottom: "0.5rem" }}
            />
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--success-600)",
              }}
            >
              {totales.totalEtiquetas}
            </div>
            <div style={{ color: "var(--gray-600)" }}>Total Etiquetas</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "var(--warning-50)",
              borderRadius: "8px",
            }}
          >
            <Calendar
              size={24}
              style={{ color: "var(--warning-600)", marginBottom: "0.5rem" }}
            />
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--warning-600)",
              }}
            >
              {totales.promedioEtiquetas}
            </div>
            <div style={{ color: "var(--gray-600)" }}>
              Promedio por Impresión
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3>Filtros</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div className="form-group">
            <label className="form-label">Fecha Inicio</label>
            <input
              type="date"
              className="form-input"
              value={filtros.fecha_inicio}
              onChange={(e) =>
                handleFiltroChange("fecha_inicio", e.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Fin</label>
            <input
              type="date"
              className="form-input"
              value={filtros.fecha_fin}
              onChange={(e) => handleFiltroChange("fecha_fin", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">ID Artículo</label>
            <input
              type="number"
              className="form-input"
              placeholder="ID del artículo"
              value={filtros.articulo_id}
              onChange={(e) =>
                handleFiltroChange("articulo_id", e.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">ID Usuario</label>
            <input
              type="number"
              className="form-input"
              placeholder="ID del usuario"
              value={filtros.usuario_id}
              onChange={(e) => handleFiltroChange("usuario_id", e.target.value)}
            />
          </div>
          <div>
            <button className="btn btn-secondary" onClick={limpiarFiltros}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Impresiones */}
      <div className="card">
        <h3>Historial Detallado</h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando historial de impresiones...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha/Hora</th>
                  <th>SKU</th>
                  <th>Descripción</th>
                  <th>Usuario</th>
                  <th>Cantidad Etiquetas</th>
                  <th>Artículo ID</th>
                </tr>
              </thead>
              <tbody>
                {impresiones.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      No hay impresiones registradas con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  impresiones.map((impresion) => (
                    <tr key={impresion.id}>
                      <td>{impresion.id}</td>
                      <td>{formatearFecha(impresion.fecha_impresion)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: "500",
                            color: "var(--primary-600)",
                          }}
                        >
                          {impresion.SKU || "N/A"}
                        </span>
                      </td>
                      <td>{impresion.Descripcion || "N/A"}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <User
                              size={14}
                              style={{ color: "var(--gray-500)" }}
                            />
                            <span style={{ fontWeight: "500" }}>
                              {impresion.usuario_nombre ||
                                `Usuario ${impresion.usuario_id}`}
                            </span>
                          </div>
                          {impresion.usuario_email && (
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--gray-600)",
                                marginLeft: "20px",
                              }}
                            >
                              {impresion.usuario_email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {impresion.cantidad}
                        </span>
                      </td>
                      <td>{impresion.articulo_id}</td>
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

export default ImpresionesSection;
