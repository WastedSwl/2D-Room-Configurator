import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', // URL вашего бэкенда
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для установки токена в заголовки по умолчанию
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Функция для удаления токена
export const removeAuthToken = () => {
    delete axiosInstance.defaults.headers.common['Authorization'];
};

// Примечание: Если вы храните токен в localStorage и хотите, чтобы он
// устанавливался при каждом запуске приложения, это лучше делать в AuthContext
// при загрузке пользователя, как показано в AuthContext.js.

export default axiosInstance;