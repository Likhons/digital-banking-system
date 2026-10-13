import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSavedUser);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  // token থাকলে /auth/me দিয়ে verify না হওয়া পর্যন্ত loading থাকবে
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  const logoutUser = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (!token) return;

    const checkAuth = async () => {
      try {
        // Authorization header টা api interceptor নিজেই localStorage থেকে বসিয়ে দেয়
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } catch {
        logoutUser();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  const loginUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  // Profile update এর পর user state & localStorage আপডেট করার ফাংশন
  const updateUser = (newData) => {
    const merged = { ...user, ...newData };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
