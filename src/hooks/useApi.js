import { useAuth } from '../contexts/AuthContext';

export const useApi = () => {
    const { token } = useAuth();
    // Elimina la URL base ya que ahora usa el proxy
    // const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const request = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

	const fullUrl = `http://172.16.101.107:3000${url}`;

        // Ahora solo usa la ruta relativa
        const response = await fetch(fullUrl, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    };

    return { request };
};