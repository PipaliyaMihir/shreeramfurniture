import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, registerUser as registerAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ── Admin auth ──────────────────────────────────
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem('srf_user');
    return u ? JSON.parse(u) : null;
  });

  // ── Public user auth ────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const u = sessionStorage.getItem('srf_public_user');
    return u ? JSON.parse(u) : null;
  });

  // Admin login
  const login = async (email, password) => {
    const res = await loginAPI({ email, password });
    const userData = res.data;
    if (userData.role !== 'admin' && userData.role !== 'superadmin') {
      throw new Error('Not authorized as admin');
    }
    sessionStorage.setItem('srf_token', userData.token);
    sessionStorage.setItem('srf_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Admin logout
  const logout = () => {
    sessionStorage.removeItem('srf_token');
    sessionStorage.removeItem('srf_user');
    setUser(null);
  };

  // Public user login
  const userLogin = async (email, password) => {
    const res = await loginAPI({ email, password });
    const userData = res.data;
    sessionStorage.setItem('srf_user_token', userData.token);
    sessionStorage.setItem('srf_public_user', JSON.stringify(userData));
    setCurrentUser(userData);
    return userData;
  };

  // Public user register
  const userRegister = async (name, email, password) => {
    const res = await registerAPI({ name, email, password });
    const userData = res.data;
    sessionStorage.setItem('srf_user_token', userData.token);
    sessionStorage.setItem('srf_public_user', JSON.stringify(userData));
    setCurrentUser(userData);
    return userData;
  };

  // Public user logout
  const userLogout = () => {
    sessionStorage.removeItem('srf_user_token');
    sessionStorage.removeItem('srf_public_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      // Admin
      user,
      login,
      logout,
      isAdmin: !!user,
      // Public user
      currentUser,
      userLogin,
      userRegister,
      userLogout,
      isLoggedIn: !!currentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
