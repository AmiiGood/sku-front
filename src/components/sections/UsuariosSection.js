import React, { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import Modal from "../common/Modal";

const UsuariosSection = () => {
  const { request } = useApi();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol_id: "",
  });

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await request("/api/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error loading usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await request("/api/roles");
      setRoles(response.data);
      // Set default rol_id to the first available role
      if (response.data.length > 0 && !formData.rol_id) {
        setFormData((prev) => ({ ...prev, rol_id: response.data[0].id }));
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      // Fallback roles if API fails
      setRoles([
        { id: 1, nombre: "Administrador" },
        { id: 2, nombre: "Operador" },
      ]);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  const handleSubmit = async () => {
    try {
      let dataToSend = { ...formData };

      // Remove password field when editing (don't send empty password)
      if (editingUsuario) {
        delete dataToSend.contrasena;
      }

      if (editingUsuario) {
        await request(`/api/usuarios/${editingUsuario.id}`, {
          method: "PUT",
          body: JSON.stringify(dataToSend),
        });
      } else {
        await request("/api/usuarios", {
          method: "POST",
          body: JSON.stringify(dataToSend),
        });
      }

      setShowModal(false);
      setEditingUsuario(null);
      setFormData({
        nombre: "",
        correo: "",
        contrasena: "",
        rol_id: roles.length > 0 ? roles[0].id : "",
      });
      loadUsuarios();
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    // Only include editable fields, exclude id and password for editing
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: "", // Don't load existing password
      rol_id: usuario.rol_id,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await request(`/api/usuarios/${id}`, { method: "DELETE" });
      loadUsuarios();
    } catch (error) {
      console.error("Error toggling usuario status:", error);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Usuarios</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              // Reset form data when opening new user modal
              setFormData({
                nombre: "",
                correo: "",
                contrasena: "",
                rol_id: roles.length > 0 ? roles[0].id : "",
              });
              setEditingUsuario(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Nuevo Usuario
          </button>
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
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className={`btn ${
                            usuario.estado ? "btn-danger" : "btn-success"
                          }`}
                          onClick={() => handleToggleStatus(usuario.id)}
                        >
                          {usuario.estado ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUsuario(null);
          // Reset form data when closing modal
          setFormData({
            nombre: "",
            correo: "",
            contrasena: "",
            rol_id: roles.length > 0 ? roles[0].id : "",
          });
        }}
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
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
              required
            />
          </div>

          {!editingUsuario && (
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

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingUsuario ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsuariosSection;
