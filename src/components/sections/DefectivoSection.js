import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToastContext } from "../../contexts/ToastContext";
import { useRole } from "../../contexts/RoleContext";
import Modal from "../common/Modal";
import Pagination from "../common/Pagination";
import SearchInput from "../common/SearchInput";

const DefectivosSection = () => {
  const { request } = useApi();
  const toast = useToastContext();
  const { hasPermission } = useRole();

  const [defectivos, setDefectivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingDefectivo, setEditingDefectivo] = useState(null);
  const [viewingDefectivo, setViewingDefectivo] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha_creacion: "",
    area: "",
    turno: "",
    defecto: "",
  });
  const [formData, setFormData] = useState({
    turno: "",
    area: "",
    defecto: "",
    pares_rechazados: "",
  });

  // Opciones predefinidas para los selectores
  const TURNOS = ["A", "B", "C"];
  const AREAS = ["Empaque en maquina", "Digital printing"];
  const DEFECTOS = [
    "BURBUJA",
    "CIERRE DE MOLDE",
    "CONTAMINADO",
    "CUADROS MORDIDO",
    "EMPEINE DEFORME",
    "ETIQUETA BOLSA EQUIVOCADA",
    "GANCHO EQUIVOCADO",
    "HANGTAG EQUIVOCADO",
    "MAL DE MEDIDA",
    "MOLDES REVUELTOS",
    "PREPACK EQUIVOCADO",
    "PUNTO DE INYECCION",
    "RAYADO",
    "REBABA EN CUADROS",
    "REBABA EN EMPEINE",
    "REBABA EN LATERAL",
    "REBABA EN LETRAS",
    "REBABA EN ORIFICIOS",
    "REBABA EN STRAP",
    "REBABA EN TALON",
    "SIN HANGTAG",
    "STRAP SAFADO",
    "SUCIO",
    "TALLAS REVUELTAS",
    "TALON JALADO",
    "TAPON BASURA",
    "TONO DE SUELA",
    "TONO STRAP",
    "VOLUMEN",
    "EXCESO DE ADHESIVO EN STRAP",
    "EXCESO DE FILM EN PISO",
    "EXCESO DE FILM EN STRAP",
    "EXCESO DE FILM EN SUELA",
    "EXCESO DE FILM EN COLLAR",
    "EXCESO DE FILM EN EMPEINE",
    "EXCESO DE FILM EN LATERAL",
    "EXCESO DE FILM EN PUNTA",
    "EXCESO DE FILM EN TALON",
    "FILM EN CUADRO",
    "FILM EN ORIFICIOS",
    "STRAP SUCIO",
    "BURBUJAS EN FILM",
    "MANCHAS DE LAVADOR",
    "JASPEADO",
    "QUEMADO",
    "EXCESO DE ADHESIVO EN SUELA",
    "RESIDUO DE CINTA",
    "MEDIDA",
    "FALTA DE FILM EN COLLAR",
    "FALTA DE FILM EN EMPEINE",
    "FALTA DE FILM EN LATERAL",
    "FALTA DE FILM EN PUNTA",
    "FALTA DE FILM EN STRAP",
    "FALTA DE FILM EN TALON",
    "ROTA EN CUADRO",
    "PUNTO DE INYECCIÓN",
    "SIN STRAP",
    "TPU DAÑADO",
    "TPU SUCIO",
    "TPU DESPEGADO",
    "EXCESO DE ADHESIVO",
    "ARRUGA INTERNA EN TALÓN",
  ];

  const loadDefectivos = async (page = 1, filtrosActuales = filtros) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...Object.fromEntries(
          Object.entries(filtrosActuales).filter(([key, value]) => value !== "")
        ),
      });

      const response = await request(`/api/defectivos?${params}`);
      setDefectivos(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error("Error loading defectivos:", error);
      toast.error("Error al cargar defectivos", 5000);
      setDefectivos([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await request("/api/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error loading usuarios:", error);
      setUsuarios([]);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filtros).filter(([key, value]) => value !== "")
        )
      );

      const response = await request(`/api/defectivos/estadisticas?${params}`);
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error loading estadísticas:", error);
      setEstadisticas([]);
    }
  };

  useEffect(() => {
    loadDefectivos(currentPage);
    loadUsuarios();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadDefectivos(1, filtros);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filtros]);

  useEffect(() => {
    loadEstadisticas();
  }, [filtros]);

  const handleSubmit = async () => {
    try {
      if (editingDefectivo) {
        if (!hasPermission("defectivos", "update")) {
          toast.error("No tienes permisos para actualizar defectivos", 3000);
          return;
        }

        await request(`/api/defectivos/${editingDefectivo.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Defectivo actualizado exitosamente", 3000);
      } else {
        if (!hasPermission("defectivos", "create")) {
          toast.error("No tienes permisos para crear defectivos", 3000);
          return;
        }

        await request("/api/defectivos", {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            pares_rechazados: parseInt(formData.pares_rechazados),
          }),
        });
        toast.success("Defectivo registrado exitosamente", 3000);
      }

      setShowModal(false);
      setEditingDefectivo(null);
      resetForm();
      loadDefectivos(currentPage);
      loadEstadisticas();
    } catch (error) {
      console.error("Error saving defectivo:", error);
      toast.error("Error al guardar el defectivo", 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      turno: "",
      area: "",
      defecto: "",
      pares_rechazados: "",
    });
  };

  const handleEdit = (defectivo) => {
    if (!hasPermission("defectivos", "update")) {
      toast.error("No tienes permisos para editar defectivos", 3000);
      return;
    }

    setEditingDefectivo(defectivo);
    setViewingDefectivo(null);
    setFormData({
      turno: defectivo.turno,
      area: defectivo.area,
      defecto: defectivo.defecto,
      pares_rechazados: defectivo.pares_rechazados.toString(),
    });
    setShowModal(true);
  };

  const handleView = (defectivo) => {
    setViewingDefectivo(defectivo);
    setEditingDefectivo(null);
    setFormData({
      turno: defectivo.turno,
      area: defectivo.area,
      defecto: defectivo.defecto,
      pares_rechazados: defectivo.pares_rechazados.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!hasPermission("defectivos", "delete")) {
      toast.error("No tienes permisos para eliminar defectivos", 3000);
      return;
    }

    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este registro de defectivo?"
      )
    ) {
      try {
        await request(`/api/defectivos/${id}`, { method: "DELETE" });
        toast.success("Defectivo eliminado exitosamente", 3000);
        loadDefectivos(currentPage);
        loadEstadisticas();
      } catch (error) {
        console.error("Error deleting defectivo:", error);
        toast.error("Error al eliminar el defectivo", 5000);
      }
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_creacion: "",
      area: "",
      turno: "",
      defecto: "",
    });
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

  const getModalTitle = () => {
    if (viewingDefectivo) return "Ver Defectivo";
    if (editingDefectivo) return "Editar Defectivo";
    return "Nuevo Defectivo";
  };

  const isReadOnly = viewingDefectivo !== null;

  const calcularTotalesEstadisticas = () => {
    if (estadisticas.length === 0) {
      return {
        totalRegistros: 0,
        totalPares: 0,
        promedioPares: 0,
      };
    }

    const totalRegistros = estadisticas.reduce(
      (sum, stat) => sum + parseInt(stat.total_registros || 0),
      0
    );
    const totalPares = estadisticas.reduce(
      (sum, stat) => sum + parseInt(stat.total_pares_rechazados || 0),
      0
    );
    const promedioPares =
      totalRegistros > 0 ? (totalPares / totalRegistros).toFixed(1) : 0;

    return { totalRegistros, totalPares, promedioPares };
  };

  const totales = calcularTotalesEstadisticas();

  if (!hasPermission("defectivos", "read")) {
    return (
      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--warning-50)",
          border: "1px solid var(--warning-200)",
          borderRadius: "var(--border-radius)",
          color: "var(--warning-800)",
          textAlign: "center",
          fontSize: "0.875rem",
        }}
      >
        No tienes permisos para acceder a esta funcionalidad
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Defectivos</h1>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowStatsModal(true)}
            style={{
              backgroundColor: "var(--primary-50)",
              borderColor: "var(--primary-600)",
              color: "var(--primary-600)",
            }}
          >
            <BarChart3 size={16} />
            Estadísticas
          </button>
          {hasPermission("defectivos", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setEditingDefectivo(null);
                setViewingDefectivo(null);
                setShowModal(true);
              }}
            >
              <Plus size={16} />
              Nuevo Defectivo
            </button>
          )}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--primary-600)",
              }}
            >
              {totales.totalRegistros}
            </div>
            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
              Total Registros
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--error-600)",
              }}
            >
              {totales.totalPares}
            </div>
            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
              Pares Rechazados
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--warning-600)",
              }}
            >
              {totales.promedioPares}
            </div>
            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
              Promedio por Registro
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
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              value={filtros.fecha_creacion}
              onChange={(e) =>
                handleFiltroChange("fecha_creacion", e.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Área</label>
            <select
              className="form-select"
              value={filtros.area}
              onChange={(e) => handleFiltroChange("area", e.target.value)}
            >
              <option value="">Todas las áreas</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Turno</label>
            <select
              className="form-select"
              value={filtros.turno}
              onChange={(e) => handleFiltroChange("turno", e.target.value)}
            >
              <option value="">Todos los turnos</option>
              {TURNOS.map((turno) => (
                <option key={turno} value={turno}>
                  Turno {turno}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Defecto</label>
            <select
              className="form-select"
              value={filtros.defecto}
              onChange={(e) => handleFiltroChange("defecto", e.target.value)}
            >
              <option value="">Todos los defectos</option>
              {DEFECTOS.map((defecto) => (
                <option key={defecto} value={defecto}>
                  {defecto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={limpiarFiltros}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de defectivos */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando defectivos...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th>Área</th>
                  <th>Defecto</th>
                  <th>Pares Rechazados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {defectivos.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      No hay defectivos registrados con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  defectivos.map((defectivo) => (
                    <tr key={defectivo.id}>
                      <td>{defectivo.id}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            {defectivo.nombre ||
                              `Usuario ${defectivo.idUsuario}`}
                          </div>
                          {defectivo.correo && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--gray-600)",
                              }}
                            >
                              {defectivo.correo}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{formatearFecha(defectivo.fecha_creacion)}</td>
                      <td>
                        <span
                          className={`badge badge-secondary turno-${defectivo.turno.toLowerCase()}`}
                        >
                          Turno {defectivo.turno}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {defectivo.area}
                        </span>
                      </td>
                      <td>{defectivo.defecto}</td>
                      <td>
                        <span
                          className="badge badge-danger"
                          style={{
                            backgroundColor: "var(--error-50)",
                            color: "var(--error-800)",
                            borderColor: "var(--error-200)",
                          }}
                        >
                          {defectivo.pares_rechazados}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleView(defectivo)}
                            title="Ver defectivo"
                          >
                            <Eye size={14} />
                          </button>
                          {hasPermission("defectivos", "update") && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleEdit(defectivo)}
                              title="Editar defectivo"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {hasPermission("defectivos", "delete") && (
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(defectivo.id)}
                              title="Eliminar defectivo"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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

      {/* Modal principal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDefectivo(null);
          setViewingDefectivo(null);
          resetForm();
        }}
        title={getModalTitle()}
      >
        <div>
          <div className="form-group">
            <label className="form-label">Turno *</label>
            <select
              className="form-select"
              value={formData.turno}
              onChange={(e) =>
                setFormData({ ...formData, turno: e.target.value })
              }
              disabled={isReadOnly}
              required
            >
              <option value="">Seleccionar turno...</option>
              {TURNOS.map((turno) => (
                <option key={turno} value={turno}>
                  Turno {turno}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Área *</label>
            <select
              className="form-select"
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
              disabled={isReadOnly}
              required
            >
              <option value="">Seleccionar área...</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Defecto *</label>
            <select
              className="form-select"
              value={formData.defecto}
              onChange={(e) =>
                setFormData({ ...formData, defecto: e.target.value })
              }
              disabled={isReadOnly}
              required
              style={{ maxHeight: "200px" }}
            >
              <option value="">Seleccionar defecto...</option>
              {DEFECTOS.map((defecto) => (
                <option key={defecto} value={defecto}>
                  {defecto}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pares Rechazados *</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={formData.pares_rechazados}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pares_rechazados: e.target.value,
                })
              }
              disabled={isReadOnly}
              min="0"
              required
            />
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!isReadOnly && (
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingDefectivo ? "Actualizar" : "Registrar"}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de estadísticas */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="Estadísticas Detalladas"
      >
        <div>
          {estadisticas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              No hay estadísticas para mostrar con los filtros actuales
            </div>
          ) : (
            <div>
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "var(--gray-50)",
                  borderRadius: "var(--border-radius)",
                }}
              >
                <h4 style={{ marginBottom: "0.5rem" }}>Resumen General</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                      {totales.totalRegistros}
                    </div>
                    <div
                      style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}
                    >
                      Registros
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                      {totales.totalPares}
                    </div>
                    <div
                      style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}
                    >
                      Pares Rechazados
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                      {totales.promedioPares}
                    </div>
                    <div
                      style={{ fontSize: "0.75rem", color: "var(--gray-600)" }}
                    >
                      Promedio
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="table-container"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>Área</th>
                      <th>Turno</th>
                      <th>Defecto</th>
                      <th>Frecuencia</th>
                      <th>Total Pares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.area}</td>
                        <td>{stat.turno}</td>
                        <td>{stat.defecto}</td>
                        <td>
                          <span className="badge badge-primary">
                            {stat.frecuencia}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-danger">
                            {stat.total_pares_rechazados}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DefectivosSection;
