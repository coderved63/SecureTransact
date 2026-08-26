import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { setUnauthorizedHandler, fetchCsrfToken, userProfile, auth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the session from the server on mount (token lives in an httpOnly cookie)
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        await fetchCsrfToken();
        const profile = await userProfile.get();
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    hydrate();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((data) => {
    // data = { email, role, firstName, lastName } — token never reaches JS
    fetchCsrfToken();
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      // Best-effort: clear local state regardless
    }
    setUser(null);
  }, []);

  // Register the 401 handler so the API layer can trigger logout on expired sessions
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
  }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
