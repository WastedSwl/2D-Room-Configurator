import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Пароли не совпадают!');
      return;
    }
    setIsLoading(true);
    try {
      const { password, confirmPassword, ...registerData } = formData;
      await register({ ...registerData, password });
      toast.success('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка регистрации. Пожалуйста, попробуйте еще раз.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg text-gray-200 p-4">
      <div className="bg-card-bg p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-blue mb-8">
          Регистрация
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1">
                Имя
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-600 rounded-md text-sm bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors"
                placeholder="Иван"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1">
                Фамилия
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-600 rounded-md text-sm bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors"
                placeholder="Иванов"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email-register"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-600 rounded-md text-sm bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-gray-400 mb-1">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              id="password-register"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-600 rounded-md text-sm bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Подтвердите Пароль
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              minLength="6"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-600 rounded-md text-sm bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-hover-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-blue transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-primary-blue hover:text-gradient-blue">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;