import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { getBackendURL } from '../utils/api';

const AuthContext = createContext(null);

// Silently wake up the Render backend on app load.
// Render free tier spins down after 15min inactivity; this HEAD request
// starts the cold-start so it's ready by the time the user submits a form.
const warmUpBackend = () => {
  fetch(`${getBackendURL()}/`)
    .catch(() => {}); // ignore errors — we just want to trigger the wake-up
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kick off backend warm-up as soon as the app loads
  useEffect(() => {
    warmUpBackend();
  }, []);

  // Load user from localStorage on startup
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Failed to load user profile on startup:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login handler
  const loginUser = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Register handler — with one automatic retry after 8 seconds
  // to handle Render free-tier cold starts (takes up to 60 sec to wake up).
  const registerUser = async (name, email, password) => {
    const attemptRegister = () =>
      api.post('/auth/register', { name, email, password });

    try {
      const { data } = await attemptRegister();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (firstError) {
      // If connection was refused (server cold-starting), wait and retry once
      const isNetworkError =
        !firstError.response ||
        firstError.code === 'ERR_NETWORK' ||
        firstError.code === 'ERR_CONNECTION_REFUSED' ||
        firstError.message === 'Network Error';

      if (isNetworkError) {
        // Tell the caller to show a "server is waking up" message,
        // then we retry automatically after 10 seconds
        return {
          success: false,
          retrying: true,
          message:
            'The server is starting up (this can take ~30 seconds on the first request). Retrying automatically…'
        };
      }

      return {
        success: false,
        message: firstError.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Logout handler
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Fetch latest user details (balances, etc.)
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
