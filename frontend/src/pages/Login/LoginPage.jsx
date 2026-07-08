import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  correo: z.string().trim().email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

function LoginPage() {
  const { login, isAuthenticated, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    const destino = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destino} replace />;
  }

  const onSubmit = async (values) => {
    setErrorServidor(null);
    setEnviando(true);
    try {
      await login(values.correo, values.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorServidor(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : error.response?.data?.error || error.message
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-xl font-semibold text-primary mb-1">TECPORT</h1>
        <p className="text-sm text-neutral mb-6">Sistema de Gestión de Operadores</p>

        {(errorServidor || authError) && (
          <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
            {errorServidor || authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">Correo</label>
            <input
              type="email"
              {...register('correo')}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral mb-1">Contraseña</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-primary text-white py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
