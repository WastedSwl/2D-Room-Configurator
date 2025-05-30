import axiosInstance from './axiosConfig'; // Используем наш настроенный экземпляр axios

const API_URL = '/api/auth'; // Базовый URL для эндпоинтов аутентификации (бэкенд на порту 5000)

const register = (userData) => {
  return axiosInstance.post(`${API_URL}/register`, userData);
};

const login = (credentials) => {
  return axiosInstance.post(`${API_URL}/login`, credentials);
};

const getProfile = () => {
  return axiosInstance.get(`${API_URL}/profile`);
};

const authService = {
  register,
  login,
  getProfile,
};

export default authService;