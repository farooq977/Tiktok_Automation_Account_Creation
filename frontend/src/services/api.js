import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API methods
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (username, email, password) => api.post('/auth/register', { username, email, password }),
    getCurrentUser: () => api.get('/auth/me'),
};

export const batchAPI = {
    createBatch: (batchSize) => api.post('/batches', { batchSize }),
    getBatches: () => api.get('/batches'),
    getBatchById: (batchId) => api.get(`/batches/${batchId}`),
};

export const accountAPI = {
    getAccounts: (params) => api.get('/accounts', { params }),
    getStats: () => api.get('/accounts/stats'),
    exportCSV: (params) => api.get('/accounts/export', { params, responseType: 'blob' }),
};

export default api;
