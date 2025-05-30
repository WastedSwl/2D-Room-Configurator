import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./components/contexts/AuthContext"; // <--- ПРОВЕРЬТЕ ЭТОТ ПУТЬ
import Configurator from "./components/Configurator/Configurator";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/RegisterPage";
import ProtectedRoute from "./components/utils/ProtectedRoute"; // <--- ПРОВЕРЬТЕ ЭТОТ ПУТЬ
import "./index.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App-container h-screen flex flex-col bg-dark-bg text-gray-200">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Configurator />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
           <ToastContainer theme="dark" position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;