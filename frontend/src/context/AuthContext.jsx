import { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Si el perfil no existe o está inactivo, cerramos la sesión de Supabase:
  // no tiene sentido dejar al usuario "logueado" pero bloqueado por el backend.
  const cargarPerfil = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setAdminProfile(data);
      setAuthError(null);
    } catch (error) {
      setAdminProfile(null);
      setAuthError(error.response?.data?.error || 'No se pudo validar tu sesión');
      await supabase.auth.signOut();
      setSession(null);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return;
      setSession(data.session);
      if (data.session) {
        await cargarPerfil();
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nuevaSesion) => {
      setSession(nuevaSesion);
      if (nuevaSesion) {
        await cargarPerfil();
      } else {
        setAdminProfile(null);
      }
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  const login = useCallback(
    async (correo, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
      if (error) throw error;
      setSession(data.session);
      await cargarPerfil();
      return data;
    },
    [cargarPerfil]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdminProfile(null);
  }, []);

  const value = {
    session,
    adminProfile,
    loading,
    authError,
    isAuthenticated: Boolean(session && adminProfile?.activo),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
