import { useState, useEffect } from 'react';
import {
  getProfile,
  getAccessToken,
  setTokens,
  clearTokens,
} from '../utils/api';
import AuthContext from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await getProfile();
      setUser(res.data);
    } catch (e) {
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = (tokens, userData) => {
    setTokens(tokens);
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
