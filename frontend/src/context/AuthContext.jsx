import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError('Откройте приложение в Telegram');
      setLoading(false);
      return;
    }
    tg.ready();
    tg.expand();

    const initData = tg.initData;
    if (!initData) {
      // Dev mode fallback
      setLoading(false);
      return;
    }

    api.auth(initData)
      .then(({ token, user }) => {
        setToken(token);
        setUser(user);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
