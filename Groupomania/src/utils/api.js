import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/auth/login',
    timeout: 2500,
});

export default api;