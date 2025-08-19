import React, { useState, useEffect } from "react";
import { Plus, Edit, Eye, Printer, TestTube } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useRole } from "../../contexts/RoleContext";
import { useToastContext } from "../../contexts/ToastContext";
import {
  ProtectedComponent,
  ProtectedButton,
} from "../common/ProtectedComponent";
import Modal from "../common/Modal";
import PrinterConfigModal from "../common/PrinterConfigModal";

const UsuariosSection = () => {
  const { request } = useApi();
  const { hasPermission } = useRole();
  const toast = useToastContext();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [viewingUsuario, setViewingUsuario] = useState(null);
  const [printerConfigUser, setPrinterConfigUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol_id: "",
    printer_ip: "",
    printer_port: 9100,
    printer_enabled: true,
  });

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await request("/api/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error loading usuarios:", error);
      toast.error("Error al cargar usuarios", 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await request("/api/roles");
      setRoles(response.data);
      if (response.data.length > 0 && !formData.rol_id) {
        setFormData((prev) => ({ ...prev, rol_id: response.data[0].id }));
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([
        { id: 1, nombre: "Administrador" },
        { id: 2, nombre: "Operador" },
        { id: 3, nombre: "Generador" },
      ]);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  // Verificar si el usuario puede acceder a esta sección
  if (!hasPermission("usuarios", "read")) {
    return (
      <ProtectedComponent module="usuarios" action="read" showMessage={true} />
    );
  }

  const handleSubmit = async () => {
    try {
      let dataToSend = { ...formData };

      if (editingUsuario) {
        if (!hasPermission("usuarios", "update")) {
          toast.error("No tienes permisos para actualizar usuarios", 3000);
          return;
        }
        delete dataToSend.contrasena;
      } else {
        if (!hasPermission("usuarios", "create")) {
          toast.error("No tienes permisos para crear usuarios", 3000);
          return;
        }
      }

      if (editingUsuario) {
        await request(`/api/usuarios/${editingUsuario.id}`, {
          method: "PUT",
          body: JSON.stringify(dataToSend),
        });
        toast.success("Usuario actualizado exitosamente", 3000);
      } else {
        await request("/api/usuarios", {
          method: "POST",
          body: JSON.stringify(dataToSend),
        });
        toast.success("Usuario creado exitosamente", 3000);
      }

      setShowModal(false);
      setEditingUsuario(null);
      setViewingUsuario(null);
      resetForm();
      loadUsuarios();
    } catch (error) {
      console.error("Error saving usuario:", error);
      toast.error("Error al guardar el usuario", 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      correo: "",
      contrasena: "",
      rol_id: roles.length > 0 ? roles[0].id : "",
      printer_ip: "",
      printer_port: 9100,
      printer_enabled: true,
    });
  };

  const handleEdit = (usuario) => {
    if (!hasPermission("usuarios", "update")) {
      toast.error("No tienes permisos para editar usuarios", 3000);
      return;
    }

    setEditingUsuario(usuario);
    setViewingUsuario(null);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: "",
      rol_id: usuario.rol_id,
      printer_ip: usuario.printer_ip || "",
      printer_port: usuario.printer_port || 9100,
      printer_enabled: usuario.printer_enabled ?? true,
    });
    setShowModal(true);
  };

  const handleView = (usuario) => {
    setViewingUsuario(usuario);
    setEditingUsuario(null);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: "",
      rol_id: usuario.rol_id,
      printer_ip: usuario.printer_ip || "",
      printer_port: usuario.printer_port || 9100,
      printer_enabled: usuario.printer_enabled ?? true,
    });
    setShowModal(true);
  };

  const handlePrinterConfig = (usuario) => {
    setPrinterConfigUser(usuario);
    setShowPrinterModal(true);
  };

  const handleToggleStatus = async (id) => {
    if (!hasPermission("usuarios", "delete")) {
      toast.error(
        "No tienes permisos para cambiar el estado de usuarios",
        3000
      );
      return;
    }

    try {
      await request(`/api/usuarios/${id}`, { method: "DELETE" });
      toast.success("Estado del usuario actualizado", 3000);
      loadUsuarios();
    } catch (error) {
      console.error("Error toggling usuario status:", error);
      toast.error("Error al cambiar el estado del usuario", 5000);
    }
  };

  const testPrinter = async (printerIp, printerPort) => {
    try {
      const response = await request("/api/printer/test", {
        method: "POST",
        body: JSON.stringify({
          printer_ip: printerIp,
          printer_port: printerPort,
        }),
      });

      if (response.success) {
        toast.success("Conexión con la impresora exitosa", 3000);
        return true;
      } else {
        toast.error("Error al conectar con la impresora", 3000);
        return false;
      }
    } catch (error) {
      console.error("Error testing printer:", error);
      toast.error("Error al probar la impresora: " + error.message, 5000);
      return false;
    }
  };

  const getModalTitle = () => {
    if (viewingUsuario) return "Ver Usuario";
    if (editingUsuario) return "Editar Usuario";
    return "Nuevo Usuario";
  };

  const isReadOnly = viewingUsuario !== null;

  const renderPrinterStatus = (usuario) => {
    if (!usuario.printer_ip) {
      return <span className="badge badge-warning">Sin configurar</span>;
    }

    if (!usuario.printer_enabled) {
      return <span className="badge badge-danger">Deshabilitada</span>;
    }

    return (
      <span className="badge badge-success">
        {usuario.printer_ip}:{usuario.printer_port || 9100}
      </span>
    );
  };

  return (
    <div>
      <div className="header">
        <h1>Usuarios</h1>
        <div className="header-actions">
          <ProtectedButton
            module="usuarios"
            action="create"
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setEditingUsuario(null);
              setViewingUsuario(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Nuevo Usuario
          </ProtectedButton>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando usuarios...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Impresora</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.correo}</td>
                    <td>
                      {roles.find((rol) => rol.id === usuario.rol_id)?.nombre ||
                        `Rol ${usuario.rol_id}`}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          usuario.estado ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {usuario.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>{renderPrinterStatus(usuario)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {/* Botón de ver */}
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleView(usuario)}
                          title="Ver usuario"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Botón de editar */}
                        <ProtectedButton
                          module="usuarios"
                          action="update"
                          className="btn btn-secondary"
                          onClick={() => handleEdit(usuario)}
                          title="Editar usuario"
                        >
                          <Edit size={14} />
                        </ProtectedButton>

                        {/* Botón de configurar impresora */}
                        <ProtectedButton
                          module="usuarios"
                          action="update"
                          className="btn btn-secondary"
                          onClick={() => handlePrinterConfig(usuario)}
                          title="Configurar impresora"
                          style={{
                            backgroundColor: "var(--primary-50)",
                            borderColor: "var(--primary-600)",
                            color: "var(--primary-600)",
                          }}
                        >
                          <Printer size={14} />
                        </ProtectedButton>

                        {/* Botón de cambiar estado */}
                        <ProtectedButton
                          module="usuarios"
                          action="delete"
                          className={`btn ${
                            usuario.estado ? "btn-danger" : "btn-success"
                          }`}
                          onClick={() => handleToggleStatus(usuario.id)}
                          title={
                            usuario.estado
                              ? "Desactivar usuario"
                              : "Activar usuario"
                          }
                        >
                          {usuario.estado ? "Desactivar" : "Activar"}
                        </ProtectedButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal principal de usuario */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUsuario(null);
          setViewingUsuario(null);
          resetForm();
        }}
        title={getModalTitle()}
      >
        <div>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-input"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
              readOnly={isReadOnly}
              required
            />
          </div>

          {!editingUsuario && !viewingUsuario && (
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                value={formData.contrasena}
                onChange={(e) =>
                  setFormData({ ...formData, contrasena: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={formData.rol_id}
              onChange={(e) =>
                setFormData({ ...formData, rol_id: parseInt(e.target.value) })
              }
              disabled={isReadOnly}
              required
            >
              <option value="">Seleccionar rol...</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Configuración de impresora */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--gray-200)",
            }}
          >
            <h3
              style={{
                marginBottom: "1rem",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              Configuración de Impresora
            </h3>

            <div className="form-group">
              <label className="form-label">IP de Impresora</label>
              <input
                type="text"
                className="form-input"
                placeholder="192.168.1.100"
                value={formData.printer_ip}
                onChange={(e) =>
                  setFormData({ ...formData, printer_ip: e.target.value })
                }
                readOnly={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Puerto de Impresora</label>
              <input
                type="number"
                className="form-input"
                placeholder="9100"
                value={formData.printer_port}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    printer_port: parseInt(e.target.value) || 9100,
                  })
                }
                readOnly={isReadOnly}
                min="1"
                max="65535"
              />
            </div>

            <div className="form-group">
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  checked={formData.printer_enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      printer_enabled: e.target.checked,
                    })
                  }
                  disabled={isReadOnly}
                />
                <span className="form-label" style={{ margin: 0 }}>
                  Impresora habilitada
                </span>
              </label>
            </div>

            {/* Botón de prueba */}
            {!isReadOnly && formData.printer_ip && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  testPrinter(formData.printer_ip, formData.printer_port)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <TestTube size={14} />
                Probar Conexión
              </button>
            )}
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
                {editingUsuario ? "Actualizar" : "Crear"}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de configuración de impresora */}
      <PrinterConfigModal
        isOpen={showPrinterModal}
        onClose={() => {
          setShowPrinterModal(false);
          setPrinterConfigUser(null);
        }}
        usuario={printerConfigUser}
        onSave={() => {
          loadUsuarios();
          setShowPrinterModal(false);
          setPrinterConfigUser(null);
        }}
      />
    </div>
  );
};

export default UsuariosSection;
