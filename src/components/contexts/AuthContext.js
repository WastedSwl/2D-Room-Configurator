// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../api/authService';
import { setAuthToken, removeAuthToken } from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null, // Изначально null, чтобы отличить от false
    isLoading: true,
    user: null,
  });

  const loadUser = useCallback(async () => {
    const tokenInStorage = localStorage.getItem('token');
    // console.log('AuthContext: loadUser called. Token in storage:', tokenInStorage);

    if (tokenInStorage) {
      setAuthToken(tokenInStorage);
      try {
        // console.log('AuthContext: Attempting to fetch profile...');
        const res = await authService.getProfile();
        // console.log('AuthContext: Profile fetched successfully:', res.data);
        setAuthState({
          token: tokenInStorage,
          isAuthenticated: true,
          isLoading: false,
          user: res.data,
        });
      } catch (err) {
        // console.error('AuthContext: Failed to load user', err.response ? err.response.data : err.message);
        localStorage.removeItem('token');
        removeAuthToken();
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } else {
      // console.log('AuthContext: No token in storage, setting auth to not authenticated.');
      setAuthState({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  // Мы не хотим, чтобы loadUser зависел от authState, чтобы избежать циклов при первой загрузке.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей для вызова один раз

  useEffect(() => {
    // console.log('AuthContext: Initial useEffect for loadUser.');
    loadUser();
  }, [loadUser]); // Зависимость от loadUser

  const login = async (email, password) => {
    // console.log('AuthContext: login called with', email);
    try {
      const res = await authService.login({ email, password });
      // console.log('AuthContext: Login successful:', res.data);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      setAuthState({ // Важно установить isLoading: false здесь тоже
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
        user: res.data.user,
      });
      return res.data;
    } catch (err) {
      // console.error('AuthContext: Login failed', err.response ? err.response.data : err.message);
      localStorage.removeItem('token');
      removeAuthToken();
      setAuthState(prev => ({ // Обновляем, сохраняя предыдущее состояние isLoading, если оно было false
        ...prev,
        token: null,
        isAuthenticated: false,
        // isLoading: false, // Можно оставить false, т.к. попытка логина завершена
        user: null,
      }));
      throw err;
    }
  };

  const register = async (userData) => {
    // console.log('AuthContext: register called');
    try {
      const res = await authService.register(userData);
      // console.log('AuthContext: Registration successful');
      return res.data;
    } catch (err) {
      // console.error('AuthContext: Registration failed', err.response ? err.response.data : err.message);
      throw err;
    }
  };

  const logout = () => {
    // console.log('AuthContext: logout called');
    localStorage.removeItem('token');
    removeAuthToken();
    setAuthState({
      token: null,
      isAuthenticated: false,
      isLoading: false, // Убедитесь, что isLoading становится false
      user: null,
    });
  };

  // Для отладки можно добавить
  // useEffect(() => {
  //   console.log('AuthContext: authState changed:', authState);
  // }, [authState]);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, loadUser }}>
      {!authState.isLoading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg text-gray-200">
            Загрузка приложения... {/* Или ваш глобальный спиннер */}
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;