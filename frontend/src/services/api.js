import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Dispatch a custom event or use a callback if needed
            // But for now, we leave it to components to handle or just let it fail
            // We can clear token here though
            // localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
