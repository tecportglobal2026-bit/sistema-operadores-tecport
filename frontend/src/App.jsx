import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import OperadoresPage from './pages/Operadores/OperadoresPage';
import NuevoOperadorPage from './pages/Operadores/NuevoOperadorPage';
import OperadorDetallePage from './pages/Operadores/OperadorDetallePage';
import EditarOperadorPage from './pages/Operadores/EditarOperadorPage';
import EmpresasPage from './pages/Empresas/EmpresasPage';
import EquiposPage from './pages/Equipos/EquiposPage';
import CertificacionesPage from './pages/Certificaciones/CertificacionesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/operadores" element={<OperadoresPage />} />
              <Route path="/operadores/nuevo" element={<NuevoOperadorPage />} />
              <Route path="/operadores/:id" element={<OperadorDetallePage />} />
              <Route path="/operadores/:id/editar" element={<EditarOperadorPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/equipos" element={<EquiposPage />} />
              <Route path="/certificaciones" element={<CertificacionesPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
