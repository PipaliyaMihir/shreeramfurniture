import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('srf_user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (email, password) => {
    const res = await loginAPI({ email, password });
    const userData = res.data;
    localStorage.setItem('srf_token', userData.token);
    localStorage.setItem('srf_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('srf_token');
    localStorage.removeItem('srf_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
