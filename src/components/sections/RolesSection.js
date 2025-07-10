import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import Modal from '../common/Modal';

const RolesSection = () => {
    const { request } = useApi();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

    const loadRoles = async () => {
        try {
            setLoading(true);
            const response = await request('/api/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleSubmit = async () => {
        try {
            if (editingRole) {
                await request(`/api/roles/${editingRole.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await request('/api/roles', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }

            setShowModal(false);
            setEditingRole(null);
            setFormData({
                nombre: '',
                descripcion: ''
            });
            loadRoles();
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            nombre: role.nombre,
            descripcion: role.descripcion
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
            try {
                await request(`/api/roles/${id}`, { method: 'DELETE' });
                loadRoles();
            } catch (error) {
                console.error('Error deleting role:', error);
            }
        }
    };

    return (
        <div>
            <div className="header">
                <h1>Roles</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus size={16} />
                        Nuevo Rol
                    </button>
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        Cargando roles...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role.id}>
                                        <td>{role.id}</td>
                                        <td>{role.nombre}</td>
                                        <td>{role.descripcion}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleEdit(role)}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(role.id)}
                                                >
                                                    <Trash2 size={14} />
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
                    setEditingRole(null);
                }}
                title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            >
                <div>
                    <div className="form-group">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            {editingRole ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RolesSection;