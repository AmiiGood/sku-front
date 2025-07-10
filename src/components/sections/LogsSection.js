import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const LogsSection = () => {
    const { request } = useApi();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const response = await request('/api/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este log?')) {
            try {
                await request(`/api/logs/${id}`, { method: 'DELETE' });
                loadLogs();
            } catch (error) {
                console.error('Error deleting log:', error);
            }
        }
    };

    return (
        <div>
            <div className="header">
                <h1>Logs del Sistema</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={loadLogs}
                    >
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
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
                                {logs.map((log) => (
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsSection;