import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:5000/api', // Hardcoded for this task as requested, ideally from import.meta.env.VITE_API_URL
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default client;
