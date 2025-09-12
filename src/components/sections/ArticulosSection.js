import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Printer, Eye } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToastContext } from "../../contexts/ToastContext";
import { useRole } from "../../contexts/RoleContext";
import Modal from "../common/Modal";
import Pagination from "../common/Pagination";
import SearchInput from "../common/SearchInput";
import PrintLabelsModal from "../common/PrintLabelsModal";
import PrinterStatusWidget from "../common/PrinterStatusWidget";

const ArticulosSection = () => {
  const { request } = useApi();
  const toast = useToastContext();
  const { hasPermission, isOperador, isGenerador } = useRole();

  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [articuloToPrint, setArticuloToPrint] = useState(null);
  const [editingArticulo, setEditingArticulo] = useState(null);
  const [viewingArticulo, setViewingArticulo] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view"
  const [formData, setFormData] = useState({
    SKU: "",
    Descripcion: "",
    UnitCode: "",
    GroupCode: "",
    FamilyCode: "",
    KindCode: "",
    ColorCode: "",
    Size: "",
    UPCCode: "",
    QuantityPerLU: "0",
  });

  const loadArticulos = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await request(`/api/articulos?${params}`);
      setArticulos(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (error) {
      console.error("Error loading articulos:", error);
      setArticulos([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticulos(currentPage, search);
  }, [currentPage, search]);

  const handleSubmit = async () => {
    try {
      if (editingArticulo) {
        if (!hasPermission("articulos", "update")) {
          toast.error("No tienes permisos para actualizar artículos", 3000);
          return;
        }

        await request(`/api/articulos/${editingArticulo.ID}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Artículo actualizado exitosamente", 3000);
      } else {
        if (!hasPermission("articulos", "create")) {
          toast.error("No tienes permisos para crear artículos", 3000);
          return;
        }

        await request("/api/articulos", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Artículo creado exitosamente", 3000);
      }

      closeModal();
      loadArticulos(currentPage, search);
    } catch (error) {
      console.error("Error saving articulo:", error);
      toast.error(
        "Error al guardar el artículo. Verifica los datos e inténtalo de nuevo.",
        5000
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArticulo(null);
    setViewingArticulo(null);
    setModalMode("create");
    setFormData({
      SKU: "",
      Descripcion: "",
      UnitCode: "",
      GroupCode: "",
      FamilyCode: "",
      KindCode: "",
      ColorCode: "",
      Size: "",
      UPCCode: "",
      QuantityPerLU: "0",
    });
  };

  const handleEdit = (articulo) => {
    if (!hasPermission("articulos", "update")) {
      toast.error("No tienes permisos para editar artículos", 3000);
      return;
    }

    setEditingArticulo(articulo);
    setViewingArticulo(null); // Limpiar el estado de viewing
    setModalMode("edit");
    setFormData({
      SKU: articulo.SKU,
      Descripcion: articulo.Descripcion,
      UnitCode: articulo.UnitCode,
      GroupCode: articulo.GroupCode,
      FamilyCode: articulo.FamilyCode,
      KindCode: articulo.KindCode,
      ColorCode: articulo.ColorCode,
      Size: articulo.Size,
      UPCCode: articulo.UPCCode,
      QuantityPerLU: articulo.QuantityPerLU.toString(),
    });
    setShowModal(true);
  };

  const handleView = (articulo) => {
    setViewingArticulo(articulo);
    setEditingArticulo(null); // Limpiar el estado de editing
    setModalMode("view");
    setFormData({
      SKU: articulo.SKU,
      Descripcion: articulo.Descripcion,
      UnitCode: articulo.UnitCode,
      GroupCode: articulo.GroupCode,
      FamilyCode: articulo.FamilyCode,
      KindCode: articulo.KindCode,
      ColorCode: articulo.ColorCode,
      Size: articulo.Size,
      UPCCode: articulo.UPCCode,
      QuantityPerLU: articulo.QuantityPerLU.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!hasPermission("articulos", "delete")) {
      toast.error("No tienes permisos para eliminar artículos", 3000);
      return;
    }

    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      try {
        await request(`/api/articulos/${id}`, { method: "DELETE" });
        toast.success("Artículo eliminado exitosamente", 3000);
        loadArticulos(currentPage, search);
      } catch (error) {
        console.error("Error deleting articulo:", error);
        toast.error("Error al eliminar el artículo. Inténtalo de nuevo.", 5000);
      }
    }
  };

  const handlePrintLabels = (articulo) => {
    if (!hasPermission("articulos", "print")) {
      toast.error("No tienes permisos para imprimir etiquetas", 3000);
      return;
    }

    setArticuloToPrint(articulo);
    setShowPrintModal(true);
  };

  const handleConfirmPrint = async (articulo, cantidad) => {
    try {
      const labelData = {
        sku: articulo.SKU,
        descripcion: articulo.Descripcion,
        color: articulo.ColorCode,
        size: articulo.Size,
        qty: articulo.QuantityPerLU,
        cantidad: cantidad,
        articulo_id: articulo.ID,
      };

      const response = await request("/api/articulos/print-labels", {
        method: "POST",
        body: JSON.stringify(labelData),
      });

      toast.success(
        `${cantidad} ${
          cantidad === 1 ? "etiqueta generada" : "etiquetas generadas"
        } exitosamente${response.impresion_registrada ? " y registrada" : ""}`,
        4000
      );

      setShowPrintModal(false);
      setArticuloToPrint(null);
    } catch (error) {
      console.error("Error printing labels:", error);
      toast.error("Error al generar las etiquetas. Inténtalo de nuevo.", 5000);
      throw error;
    }
  };

  // Determinar el título del modal basado en modalMode
  const getModalTitle = () => {
    switch (modalMode) {
      case "view":
        return "Ver Artículo";
      case "edit":
        return "Editar Artículo";
      case "create":
      default:
        return "Nuevo Artículo";
    }
  };

  // Determinar si los campos deben ser readonly basado en modalMode
  const isReadOnly = modalMode === "view";

  return (
    <div>
      <div className="header">
        <h1>Artículos</h1>
        <div className="header-actions">
          {hasPermission("articulos", "create") && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setModalMode("create");
                setEditingArticulo(null);
                setViewingArticulo(null);
                setFormData({
                  SKU: "",
                  Descripcion: "",
                  UnitCode: "",
                  GroupCode: "",
                  FamilyCode: "",
                  KindCode: "",
                  ColorCode: "",
                  Size: "",
                  UPCCode: "",
                  QuantityPerLU: "0",
                });
                setShowModal(true);
              }}
            >
              <Plus size={16} />
              Nuevo Artículo
            </button>
          )}
        </div>
      </div>

      {/* Widget de estado de impresora */}
      <PrinterStatusWidget />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar artículos..."
      />

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando artículos...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Descripción</th>
                  <th>Código de Unidad</th>
                  <th>Grupo</th>
                  <th>Color</th>
                  <th>Talla</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articulos.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      {search
                        ? `No se encontraron artículos que coincidan con "${search}"`
                        : "No hay artículos registrados"}
                    </td>
                  </tr>
                ) : (
                  articulos.map((articulo) => (
                    <tr key={articulo.ID}>
                      <td>{articulo.ID}</td>
                      <td>{articulo.SKU}</td>
                      <td>{articulo.Descripcion}</td>
                      <td>{articulo.UnitCode}</td>
                      <td>{articulo.GroupCode}</td>
                      <td>{articulo.ColorCode}</td>
                      <td>{articulo.Size}</td>
                      <td>
                        <span
                          className={`badge ${
                            articulo.Eliminado
                              ? "badge-danger"
                              : "badge-success"
                          }`}
                        >
                          {articulo.Eliminado ? "Eliminado" : "Activo"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {/* Botón de ver (siempre disponible) */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleView(articulo)}
                            title="Ver artículo"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Botón de editar (solo con permisos) */}
                          {hasPermission("articulos", "update") && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleEdit(articulo)}
                              title="Editar artículo"
                            >
                              <Edit size={14} />
                            </button>
                          )}

                          {/* Botón de imprimir (solo con permisos) */}
                          {hasPermission("articulos", "print") && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handlePrintLabels(articulo)}
                              title="Imprimir etiquetas"
                              style={{
                                backgroundColor: "var(--success-50)",
                                borderColor: "var(--success-600)",
                                color: "var(--success-600)",
                              }}
                            >
                              <Printer size={14} />
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

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={getModalTitle()}
      >
        <div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              className="form-input"
              value={formData.SKU}
              onChange={(e) =>
                setFormData({ ...formData, SKU: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              className="form-input"
              value={formData.Descripcion}
              onChange={(e) =>
                setFormData({ ...formData, Descripcion: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Código de Unidad</label>
            <input
              type="text"
              className="form-input"
              value={formData.UnitCode}
              onChange={(e) =>
                setFormData({ ...formData, UnitCode: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Grupo</label>
            <input
              type="text"
              className="form-input"
              value={formData.GroupCode}
              onChange={(e) =>
                setFormData({ ...formData, GroupCode: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Familia</label>
            <input
              type="text"
              className="form-input"
              value={formData.FamilyCode}
              onChange={(e) =>
                setFormData({ ...formData, FamilyCode: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo</label>
            <input
              type="text"
              className="form-input"
              value={formData.KindCode}
              onChange={(e) =>
                setFormData({ ...formData, KindCode: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <input
              type="text"
              className="form-input"
              value={formData.ColorCode}
              onChange={(e) =>
                setFormData({ ...formData, ColorCode: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Talla</label>
            <input
              type="text"
              className="form-input"
              value={formData.Size}
              onChange={(e) =>
                setFormData({ ...formData, Size: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Código UPC</label>
            <input
              type="text"
              className="form-input"
              value={formData.UPCCode}
              onChange={(e) =>
                setFormData({ ...formData, UPCCode: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cantidad por LU</label>
            <input
              type="number"
              className="form-input"
              value={formData.QuantityPerLU}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  QuantityPerLU: e.target.value,
                })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={closeModal}
            >
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!isReadOnly && (
              <button className="btn btn-primary" onClick={handleSubmit}>
                {modalMode === "edit" ? "Actualizar" : "Crear"}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {hasPermission("articulos", "print") && (
        <PrintLabelsModal
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setArticuloToPrint(null);
          }}
          articulo={articuloToPrint}
          onPrint={handleConfirmPrint}
        />
      )}
    </div>
  );
};

export default ArticulosSection;